export interface RuleScore {
  score: number;
  signals: string[];
  skip: boolean;
  isPriceInquiry: boolean;
}

const PRICE_INQUIRY_PATTERNS =
  /\bprice\b|how much|how many|what.s the (cost|price)|quotation|\bquote\b|price ?list|pricelist|\bMOQ\b|minimum order|per unit|per piece|per ton|per kg|cost of|what (is|are) the price|tender|procurement|RFQ|request for quotation/i;

export function isPriceInquiry(text: string): boolean {
  return PRICE_INQUIRY_PATTERNS.test(text);
}

export function applyRules(text: string): RuleScore {
  const skipPatterns = [
    { pattern: /we are (a )?(manufacturer|factory|supplier|producer|distributor)/i, reason: '制造商页面' },
    { pattern: /our (factory|company|products?|machines?|plant) (offer|provide|supply|manufacture|export)/i, reason: '供应商推广' },
    { pattern: /in stock|available (now|for immediate delivery|to ship)/i, reason: '现货销售页面' },
    { pattern: /FOB price|CIF price|factory direct|ex.?works|EXW price/i, reason: '工厂报价页面' },
    { pattern: /add to cart|buy now|product catalog|product catalogue/i, reason: '电商产品页面' },
    { pattern: /\$[\d,]+\s*\/\s*(unit|piece|pcs|ton|mt)\b/i, reason: '价格列表页面' },
    { pattern: /alibaba\.com|made-in-china\.com|global\.sources|indiamart\.com/i, reason: '供应商平台' },
    { pattern: /出售|转让|低价卖|急售|厂家直销/, reason: '中文出售广告' },
    { pattern: /#(stonecrushersupplier|crushersupplier|jawcrushersupplier|miningequipment)/i, reason: '卖家标签' },
    { pattern: /\bjual\b|\bdijual\b/i, reason: '印尼语出售' },
  ];

  for (const { pattern, reason } of skipPatterns) {
    if (pattern.test(text)) {
      return { score: 0, signals: [reason], skip: true, isPriceInquiry: false };
    }
  }

  if (isPriceInquiry(text)) {
    return { score: 7, signals: ['价格/采购询问'], skip: false, isPriceInquiry: true };
  }

  return { score: 5, signals: [], skip: false, isPriceInquiry: false };
}
