import axios from 'axios';
import { SearchResult } from '../../types';
import { logger } from '../../core/logger';

export const MINING_KEYWORDS = [
  // 西班牙语买方询盘
  'cotizacion chancadora quijada minera',
  'solicitud presupuesto trituradora cono mina',
  'licitacion equipo minero trituradora',
  'buscamos proveedor chancadora planta',
  'necesitamos molino bolas procesamiento mineral',
  // 英语买方询盘
  'jaw crusher RFQ mining company procurement',
  'cone crusher purchase inquiry quarry operation',
  'mining equipment tender crushing plant bid',
  'crusher supplier wanted mining project',
  'ball mill purchase order mining operation',
  // 特定市场公司询价
  'mining company crusher quotation request',
  'quarry project equipment supplier inquiry',
  // 经销商 / 贸易商采购
  'distribuidor maquinaria minera',
  'dealer used crusher',
  'importador chancadora segunda mano',
  'mining equipment dealer',
  'used crusher reseller Africa',
  'maquinaria minera importador mayorista',
];

// 过滤掉内容平台、电商平台，只保留真实买家页面
export const BLOCKED_DOMAINS = [
  'youtube.com',
  'tiktok.com',
  'alibaba.com',
  'instagram.com',
  'facebook.com',
  'amazon.com',
  'aliexpress.com',
  'made-in-china.com',
  'tradekey.com',
  'twitter.com',
  'linkedin.com',
];

const SITE_EXCLUSION = BLOCKED_DOMAINS.map(d => `-site:${d}`).join(' ');

export const TARGET_MARKETS = [
  'Peru', 'Chile', 'Colombia', 'Mexico',
  'Indonesia', 'Ghana', 'Nigeria',
];

export async function searchCompanyContact(
  companyName: string,
  domain?: string
): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return '';

  const texts: string[] = [];

  try {
    const res = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: apiKey,
        engine: 'google',
        q: `"${companyName}" email contact phone`,
        num: 5,
        hl: 'en',
        gl: 'us',
      },
      timeout: 12000,
    });
    for (const item of res.data.organic_results || []) {
      texts.push(item.snippet || '');
      texts.push(item.title || '');
    }
    if (res.data.knowledge_graph) {
      texts.push(JSON.stringify(res.data.knowledge_graph));
    }
  } catch {
    // ignore
  }

  if (domain) {
    await new Promise(r => setTimeout(r, 800));
    try {
      const res = await axios.get('https://serpapi.com/search', {
        params: {
          api_key: apiKey,
          engine: 'google',
          q: `site:${domain} contact email phone`,
          num: 5,
          hl: 'en',
        },
        timeout: 12000,
      });
      for (const item of res.data.organic_results || []) {
        texts.push(item.snippet || '');
      }
    } catch {
      // ignore
    }
  }

  return texts.join(' ');
}

export async function searchGoogle(
  keyword: string,
  market: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    logger.error('SERPAPI_KEY not set in .env');
    return [];
  }

  logger.info(`Searching`, { keyword, market });

  try {
    const res = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: apiKey,
        engine: 'google',
        q: `${keyword} ${market} ${SITE_EXCLUSION}`,
        num: maxResults,
        hl: 'es',
        gl: 'us',
      },
      timeout: 15000,
    });

    const items = res.data.organic_results || [];
    const results: SearchResult[] = items.map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || '',
    }));

    logger.info(`Results`, { keyword, market, count: results.length });
    return results;

  } catch (err: any) {
    logger.warn(`Search failed`, { keyword, market, error: err.message });
    return [];
  }
}
