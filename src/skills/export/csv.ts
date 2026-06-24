import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { TradeLead } from '../../types';
import { logger } from '../../core/logger';

const B_END_TYPES = new Set(['distributor', 'dealer', 'reseller', 'trader']);

// 12分制：AI基础分(0-10) + 价格询盘加成(+2)，上限12
function intentScore(aiScore: number, isPriceInquiry: boolean): number {
  return Math.min(12, aiScore + (isPriceInquiry ? 2 : 0));
}

function intentLevel(score: number): string {
  if (score >= 10) return '🔴极高';
  if (score >= 7)  return '🟠高';
  if (score >= 4)  return '🟡中';
  return '🟢低';
}

function specialFlags(lead: TradeLead): string {
  const flags: string[] = [];
  if (lead.isPriceInquiry)                              flags.push('🔥价格询盘');
  if (B_END_TYPES.has(lead.score?.companyType ?? ''))   flags.push('⭐经销商');
  if (lead.source === 'tender')                         flags.push('📋招标');
  if (lead.source === 'project')                        flags.push('🏗️项目');
  if ((lead.contacts.emails.length ?? 0) > 0)           flags.push('📧有邮箱');
  if ((lead.contacts.whatsapp.length ?? 0) > 0)         flags.push('💬有WA');
  return flags.join(' ');
}

function clientSegment(companyType: string): string {
  return B_END_TYPES.has(companyType) ? 'B端' : 'C端';
}

function followPriority(companyType: string, score: number): string {
  if (B_END_TYPES.has(companyType)) return '🟡 经销商';
  if (score >= 10) return '🔴 极优先';
  if (score >= 7)  return '🔴 优先';
  if (score >= 5)  return '🟠 跟进';
  return '🟢 普通';
}

// 清理号码为纯数字（保留前置+号的国家码）
function cleanPhone(raw: string): string {
  const stripped = raw.trim();
  const hasPlus = stripped.startsWith('+');
  const digits = stripped.replace(/\D/g, '');
  return hasPlus ? digits : digits;
}

function formatWhatsAppLinks(waList: string[]): string {
  return waList
    .map(wa => {
      const digits = wa.replace(/\D/g, '');
      return digits.length >= 8 ? `https://wa.me/${digits}` : '';
    })
    .filter(Boolean)
    .join(' | ');
}

function linkedInSearchUrl(company: string): string {
  if (!company || company === 'Unknown') return '';
  const q = encodeURIComponent(`${company} mining equipment`);
  return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
}

function googleOsintUrl(company: string, market: string): string {
  if (!company || company === 'Unknown') return '';
  const q = encodeURIComponent(`"${company}" ${market} mining`);
  return `https://www.google.com/search?q=${q}`;
}

export function exportToCsv(leads: TradeLead[], label: string): string {
  const exportDir = process.env.EXPORT_DIR
    ? process.env.EXPORT_DIR.replace('~', os.homedir())
    : path.join(os.homedir(), 'Desktop', '矿机客户线索');

  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  const filename = `trade-leads-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
  const filepath = path.join(exportDir, filename);

  const rows = leads.map(l => {
    const aiScore  = l.score?.buyerIntentScore ?? 0;
    const score12  = intentScore(aiScore, l.isPriceInquiry ?? false);
    const company  = l.score?.companyName || l.companyName || '';

    return {
      '意向分':           score12,
      '意向等级':         intentLevel(score12),
      '特殊标记':         specialFlags(l),
      '姓名':             '',
      '公司名':           company,
      '邮箱':             l.contacts.emails.join(' | '),
      '电话':             l.contacts.phones.map(cleanPhone).join(' | '),
      'WhatsApp链接':     formatWhatsAppLinks(l.contacts.whatsapp),
      'LinkedIn搜索链接': linkedInSearchUrl(company),
      'Google OSINT':    googleOsintUrl(company, l.market),
      '市场':             l.market,
      '客户类型':         clientSegment(l.score?.companyType ?? ''),
      '跟进优先级':       followPriority(l.score?.companyType ?? '', score12),
      '设备需求':         (l.score?.needsIdentified ?? []).join('; '),
      '产品匹配':         l.score?.productMatch ?? '',
      '开发建议':         l.score?.suggestedApproach ?? '',
      '意向原因':         l.score?.buyerIntentReason ?? '',
      '来源关键词':       l.keyword,
      'URL':              l.url,
      '摘要':             l.snippet.slice(0, 300),
      '发现时间':         l.timestamp,
    };
  });

  const csv = stringify(rows, { header: true });
  fs.writeFileSync(filepath, '﻿' + csv, 'utf8');  // BOM for Excel Chinese display

  logger.info(`CSV exported: ${filepath} (${leads.length} leads)`);
  return filepath;
}
