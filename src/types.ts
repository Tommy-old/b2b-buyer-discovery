import { ContactInfo } from './skills/extractors/contact';

export type { ContactInfo };

export interface LeadScore {
  buyerIntentScore: number;
  buyerIntentReason: string;
  needsIdentified: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  country?: string;
  companyType: string;
  productMatch: string;
  suggestedApproach: string;
  companyName?: string;
}

export interface TradeLead {
  keyword: string;
  market: string;
  source: 'google' | 'tender' | 'project';
  title: string;
  url: string;
  domain: string;
  snippet: string;
  fullText?: string;
  companyName?: string;
  country?: string;
  contacts: ContactInfo;
  score?: LeadScore;
  ruleScore?: number;
  isPriceInquiry?: boolean;
  timestamp: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface HuntingOptions {
  keywords?: string[];
  markets?: string[];
  maxResults?: number;
  minScore?: number;
  exportCsv?: boolean;
}
