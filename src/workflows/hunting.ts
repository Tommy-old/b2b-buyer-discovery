import { searchGoogle, searchCompanyContact, MINING_KEYWORDS, TARGET_MARKETS, BLOCKED_DOMAINS } from '../skills/search/google';
import { extractContacts, extractCompanyName, detectCountry, ContactInfo } from '../skills/extractors/contact';
import { scoreLeadsBatch } from '../skills/ai/scorer';
import { exportToCsv } from '../skills/export/csv';
import { upsertLead, getStats } from '../skills/db/leads-db';
import { logger } from '../core/logger';
import { TradeLead, HuntingOptions } from '../types';
import axios from 'axios';

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
    });
    return String(res.data).replace(/<[^>]+>/g, ' ').slice(0, 2000);
  } catch {
    return '';
  }
}

function mergeContacts(base: ContactInfo, extra: ContactInfo): ContactInfo {
  return {
    emails:   [...new Set([...base.emails,   ...extra.emails])],
    phones:   [...new Set([...base.phones,   ...extra.phones])],
    whatsapp: [...new Set([...base.whatsapp, ...extra.whatsapp])],
    wechat:   [...new Set([...base.wechat,   ...extra.wechat])],
    website:  base.website || extra.website,
  };
}

export async function runHuntingWorkflow(opts: HuntingOptions = {}): Promise<TradeLead[]> {
  const {
    keywords = MINING_KEYWORDS.slice(0, 5),
    markets = (process.env.TARGET_MARKETS || 'Peru,Indonesia,Ghana').split(',').slice(0, 3),
    maxResults = 10,
    minScore = Number(process.env.MIN_SCORE) || 5,
    exportCsv = true,
  } = opts;

  logger.info('=== Trade Hunting Workflow Started ===', { keywords: keywords.length, markets });

  const allResults: Array<{ title: string; url: string; snippet: string; keyword: string; market: string }> = [];

  // Step 1: Google Custom Search API 搜索
  for (const market of markets) {
    for (const keyword of keywords) {
      const results = await searchGoogle(keyword, market, maxResults);
      for (const r of results) {
        allResults.push({ ...r, keyword, market });
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  logger.info(`Total results: ${allResults.length}`);

  // 去重 + 过滤内容平台/电商域名
  const seen = new Set<string>();
  const unique = allResults.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    const domain = extractDomain(r.url);
    if (BLOCKED_DOMAINS.some(blocked => domain === blocked || domain.endsWith('.' + blocked))) {
      logger.debug(`Filtered blocked domain: ${domain}`);
      return false;
    }
    return true;
  });
  logger.info(`After dedup+filter: ${unique.length}`);

  // Step 2: 抓页面内容 + 提取联系方式
  const enriched = [];
  for (let i = 0; i < unique.length; i++) {
    const r = unique[i];
    logger.info(`Fetching ${i + 1}/${unique.length}: ${r.url.slice(0, 60)}`);
    const fullText = await fetchPageText(r.url);
    const contacts = extractContacts(fullText + ' ' + r.snippet);
    const companyName = extractCompanyName(fullText, r.title);
    const country = detectCountry(fullText + r.url, r.market);
    enriched.push({ ...r, fullText, contacts, companyName, country, domain: extractDomain(r.url) });
    await new Promise(r => setTimeout(r, 500));
  }

  // Step 3: 规则引擎 + DeepSeek AI 双层评分
  logger.info('Scoring with rule engine + DeepSeek AI...');
  const scored = await scoreLeadsBatch(
    enriched.map(e => ({ title: e.title, snippet: e.snippet, fullText: e.fullText, keyword: e.keyword, market: e.market })),
    minScore
  );

  // Step 4: 组装结果
  const leads: TradeLead[] = scored
    .map(({ index, score, ruleScore, isPriceInquiry }) => ({
      keyword: enriched[index].keyword,
      market: enriched[index].market,
      source: 'google' as const,
      title: enriched[index].title,
      url: enriched[index].url,
      domain: enriched[index].domain,
      snippet: enriched[index].snippet,
      fullText: enriched[index].fullText,
      companyName: enriched[index].companyName,
      country: enriched[index].country,
      contacts: enriched[index].contacts,
      score,
      ruleScore,
      isPriceInquiry,
      timestamp: new Date().toISOString(),
    }))
    .sort((a, b) => (b.score?.buyerIntentScore || 0) - (a.score?.buyerIntentScore || 0));

  logger.info(`Qualified leads: ${leads.length}`);

  // Step 4.5: SerpAPI 二次搜索 — 按公司名补全联系方式
  logger.info('Enriching contacts via SerpAPI company+email search...');
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const companyName = (lead.score?.companyName || lead.companyName || '').trim();
    if (!companyName || companyName === 'Unknown') continue;

    logger.info(`Contact search ${i + 1}/${leads.length}: ${companyName}`);
    const extraText = await searchCompanyContact(companyName, lead.domain || undefined);
    if (extraText) {
      const extraContacts = extractContacts(extraText);
      leads[i] = { ...lead, contacts: mergeContacts(lead.contacts, extraContacts) };
      const merged = leads[i].contacts;
      if (merged.emails.length || merged.phones.length) {
        logger.info(`  +${extraContacts.emails.length} email(s), +${extraContacts.phones.length} phone(s)`);
      }
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  // Step 5: 存库 + 导出
  for (const lead of leads) upsertLead(lead);
  if (exportCsv && leads.length > 0) exportToCsv(leads, markets.join('-'));

  // Step 6: 打印统计
  const stats = getStats() as any;
  logger.info(`Total: ${stats.total} | High intent(7+): ${stats.highIntent} | With contact: ${stats.withContact} | Price inquiry: ${stats.priceInquiry}`);

  leads.slice(0, 5).forEach((l, i) => {
    logger.info(`#${i + 1} [AI:${l.score?.buyerIntentScore}/10 Rule:${l.ruleScore}] ${l.score?.companyName || l.companyName || l.title.slice(0, 40)}`);
    logger.info(`   ${l.score?.companyType} | ${l.score?.productMatch} | ${l.country}`);
    logger.info(`   ${l.score?.suggestedApproach}`);
    if (l.contacts.emails.length) logger.info(`   Email: ${l.contacts.emails[0]}`);
    if (l.contacts.whatsapp.length) logger.info(`   WA: ${l.contacts.whatsapp[0]}`);
  });

  logger.info('=== Done ===');
  return leads;
}
