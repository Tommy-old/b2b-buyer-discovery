import axios from 'axios';
import { LeadScore } from '../../types';
import { applyRules } from './rules';
import { logger } from '../../core/logger';

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set in .env');

  const res = await axios.post(
    DEEPSEEK_API,
    {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 600,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return res.data.choices?.[0]?.message?.content || '';
}

export async function scoreLead(
  title: string,
  snippet: string,
  fullText: string,
  keyword: string,
  market: string
): Promise<LeadScore> {
  const prompt = `You are a filter that removes supplier pages. Analyze this Google search result for mining/quarry equipment buyers.

ONLY return score 0 if this is CLEARLY a supplier/seller page:
- Manufacturer advertising their own equipment
- Factory or trading company promoting services
- Alibaba / product catalog / ecommerce pages
- Price lists from a seller perspective

IMPORTANT — distributors, dealers, and resellers are HIGH-VALUE procurement buyers:
- They buy equipment in volume to resell or import → score 7-9
- Do NOT lower their score just because they are not an end-user mine
- Keywords like "distribuidor", "dealer", "reseller", "importador", "mayorista", "trading" signal B2B procurement demand

For EVERYTHING ELSE return score 5-10:
- Quarries or mines looking to purchase equipment → 8-10
- EPC/contractor with procurement need → 7-9
- Government or project tender → 8-10
- Distributor / dealer / reseller / importer seeking stock → 7-9
- Used equipment buyer inquiry → 7-8
- General industry discussion → 5-6
- ANY doubt → score 5

Keyword: "${keyword}"
Target market: ${market}
Title: ${title}
Snippet: ${snippet}
Full text (first 800 chars): ${fullText.slice(0, 800)}

Return ONLY a JSON object (no markdown, no explanation):
{
  "buyerIntentScore": <0-10>,
  "buyerIntentReason": "<one sentence why this score>",
  "needsIdentified": ["<need 1>", "<need 2>"],
  "suggestedApproach": "<one sentence on how to contact>",
  "language": "<ISO 639-1 code>",
  "sentiment": "<positive | neutral | negative>",
  "country": "<country name in English inferred from content, language, URL, or location mentions. Use Unknown if unclear>",
  "companyType": "<quarry | mining | epc | distributor | dealer | reseller | trader | contractor | unknown>",
  "productMatch": "<specific product they need, e.g. jaw crusher, cone crusher, ball mill, screening plant>",
  "companyName": "<company or organization name if mentioned, or Unknown>"
}`;

  try {
    const raw = await callDeepSeek(prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as LeadScore;
  } catch (err: any) {
    logger.warn('AI scoring failed, using defaults', { error: err.message });
    return {
      buyerIntentScore: 0,
      buyerIntentReason: 'Scoring unavailable',
      needsIdentified: [],
      suggestedApproach: 'Review manually',
      language: 'unknown',
      sentiment: 'neutral',
      country: 'Unknown',
      companyType: 'unknown',
      productMatch: keyword,
      companyName: 'Unknown',
    };
  }
}

export async function scoreLeadsBatch(
  leads: Array<{ title: string; snippet: string; fullText: string; keyword: string; market: string }>,
  minScore: number = 4
): Promise<Array<{ index: number; score: LeadScore; ruleScore: number; isPriceInquiry: boolean }>> {
  const results: Array<{ index: number; score: LeadScore; ruleScore: number; isPriceInquiry: boolean }> = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    logger.info(`Scoring ${i + 1}/${leads.length}: ${lead.title.slice(0, 50)}`);

    // 第一层：规则引擎快速预筛
    const ruleResult = applyRules(lead.title + ' ' + lead.snippet + ' ' + lead.fullText);
    if (ruleResult.skip) {
      logger.info(`Rule skip: ${ruleResult.signals[0]}`);
      continue;
    }

    // 第二层：AI 精评
    const score = await scoreLead(lead.title, lead.snippet, lead.fullText, lead.keyword, lead.market);

    if (score.buyerIntentScore >= minScore) {
      results.push({ index: i, score, ruleScore: ruleResult.score, isPriceInquiry: ruleResult.isPriceInquiry });
      logger.info(`✓ Score ${score.buyerIntentScore}/10 - ${score.companyType}`, { title: lead.title.slice(0, 40) });
    } else {
      logger.info(`✗ Score ${score.buyerIntentScore}/10 - filtered`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}
