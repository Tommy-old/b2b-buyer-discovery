import fs from 'fs';
import path from 'path';
import { TradeLead } from '../../types';
import { logger } from '../../core/logger';

const DB_PATH = path.resolve('./data/leads.db.json');

export interface LeadRecord {
  id: string;
  firstSeen: string;
  lastSeen: string;
  seenCount: number;
  keywords: string[];
  markets: string[];
  status: string;
  ruleScore: number;
  aiScore: number;
  isPriceInquiry: boolean;
  source: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  companyName: string;
  companyType: string;
  country: string;
  language: string;
  sentiment: string;
  productMatch: string;
  needsIdentified: string;
  suggestedApproach: string;
  intentReason: string;
  emails: string;
  phones: string;
  whatsapp: string;
  wechat: string;
  website: string;
  fullTextPreview: string;
  timestamp: string;
}

interface LeadsDB {
  leads: Record<string, LeadRecord>;
  lastUpdated: string;
}

function loadDB(): LeadsDB {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }
  return { leads: {}, lastUpdated: new Date().toISOString() };
}

function saveDB(db: LeadsDB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function upsertLead(lead: TradeLead): LeadRecord {
  const db = loadDB();
  const id = lead.url;
  const now = new Date().toISOString();

  try {
    if (db.leads[id]) {
      const existing = db.leads[id];
      existing.lastSeen = now;
      existing.seenCount += 1;
      if (!existing.keywords.includes(lead.keyword)) existing.keywords.push(lead.keyword);
      if (!existing.markets.includes(lead.market)) existing.markets.push(lead.market);
      existing.aiScore = Math.max(existing.aiScore, lead.score?.buyerIntentScore ?? 0);
      existing.ruleScore = Math.max(existing.ruleScore, lead.ruleScore ?? 0);
      if (lead.isPriceInquiry) existing.isPriceInquiry = true;
      db.leads[id] = existing;
    } else {
      db.leads[id] = {
        id,
        firstSeen: now,
        lastSeen: now,
        seenCount: 1,
        keywords: [lead.keyword],
        markets: [lead.market],
        status: 'new',
        ruleScore: lead.ruleScore ?? 0,
        aiScore: lead.score?.buyerIntentScore ?? 0,
        isPriceInquiry: lead.isPriceInquiry ?? false,
        source: lead.source,
        title: lead.title,
        url: lead.url,
        domain: lead.domain,
        snippet: lead.snippet.slice(0, 300),
        companyName: lead.score?.companyName || lead.companyName || '',
        companyType: lead.score?.companyType ?? '',
        country: lead.score?.country || lead.country || '',
        language: lead.score?.language ?? '',
        sentiment: lead.score?.sentiment ?? '',
        productMatch: lead.score?.productMatch ?? '',
        needsIdentified: (lead.score?.needsIdentified ?? []).join('; '),
        suggestedApproach: lead.score?.suggestedApproach ?? '',
        intentReason: lead.score?.buyerIntentReason ?? '',
        emails: lead.contacts.emails.join('; '),
        phones: lead.contacts.phones.join('; '),
        whatsapp: lead.contacts.whatsapp.join('; '),
        wechat: lead.contacts.wechat.join('; '),
        website: lead.contacts.website || '',
        fullTextPreview: (lead.fullText || '').slice(0, 300).replace(/\n/g, ' '),
        timestamp: lead.timestamp,
      };
    }

    db.lastUpdated = now;
    saveDB(db);
  } catch (err: any) {
    logger.warn('DB upsert failed', { error: err.message });
  }

  return db.leads[id];
}

export function getStats() {
  const db = loadDB();
  const leads = Object.values(db.leads);
  const byCountry: Record<string, number> = {};
  leads.forEach(l => {
    byCountry[l.country] = (byCountry[l.country] || 0) + 1;
  });
  return {
    total: leads.length,
    highIntent: leads.filter(l => l.aiScore >= 7).length,
    withContact: leads.filter(l => l.whatsapp || l.phones || l.emails).length,
    priceInquiry: leads.filter(l => l.isPriceInquiry).length,
    byCountry,
    lastUpdated: db.lastUpdated,
  };
}

export function getTopLeads(limit = 50): LeadRecord[] {
  const db = loadDB();
  return Object.values(db.leads)
    .sort((a, b) => {
      const scoreA = a.aiScore * 0.6 + a.ruleScore * 0.2 + Math.min(a.seenCount, 5) * 0.2 + (a.isPriceInquiry ? 1 : 0);
      const scoreB = b.aiScore * 0.6 + b.ruleScore * 0.2 + Math.min(b.seenCount, 5) * 0.2 + (b.isPriceInquiry ? 1 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function exportTopLeadsCsv(limit = 50): void {
  const top = getTopLeads(limit);

  const dir = path.resolve('./exports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const outPath = path.join(dir, `top_leads_${new Date().toISOString().slice(0, 10)}.csv`);

  const header = [
    'AI Score', 'Rule Score', 'Price Inquiry', 'Seen Count', 'Status',
    'Company Name', 'Company Type', 'Country', 'Language', 'Sentiment',
    'Emails', 'Phones', 'WhatsApp', 'WeChat', 'Website',
    'Product Match', 'Needs Identified', 'Suggested Approach', 'Intent Reason',
    'Source', 'All Keywords', 'All Markets', 'Title', 'URL', 'Domain', 'Snippet',
    'First Seen', 'Last Seen', 'Timestamp',
  ];

  const lines = [header.join(',')];
  for (const l of top) {
    const cols = [
      l.aiScore, l.ruleScore, l.isPriceInquiry ? 'YES' : '', l.seenCount, l.status,
      l.companyName, l.companyType, l.country, l.language, l.sentiment,
      l.emails, l.phones, l.whatsapp, l.wechat, l.website,
      l.productMatch, l.needsIdentified, l.suggestedApproach, l.intentReason,
      l.source, l.keywords.join('|'), l.markets.join('|'), l.title, l.url, l.domain, l.snippet,
      l.firstSeen, l.lastSeen, l.timestamp,
    ];
    lines.push(cols.map(v => JSON.stringify(String(v ?? ''))).join(','));
  }

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  logger.info(`Top ${top.length} leads exported to ${outPath}`);
}
