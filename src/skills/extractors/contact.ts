export interface ContactInfo {
  emails: string[];
  phones: string[];
  whatsapp: string[];
  wechat: string[];
  website?: string;
}

export function extractContacts(text: string): ContactInfo {
  const emails = [...new Set(
    (text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])
      .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg'))
  )];

  const phones = [...new Set(
    (text.match(/\+?[\d\s\-().]{10,20}/g) || [])
      .map(p => p.trim().replace(/\s+/g, ' '))
      .filter(p => p.replace(/\D/g, '').length >= 8)
  )];

  const whatsapp = [...new Set(
    (text.match(/(?:whatsapp|wa\.me|whatsapp\.com)[:\s/]*\+?[\d\s\-]{8,}/gi) || [])
      .map(w => w.replace(/whatsapp[:\s]*/i, '').trim())
  )];

  const wechat = [...new Set(
    (text.match(/(?:wechat|weixin|wx)[:\s#@]*([a-zA-Z0-9_\-]{4,20})/gi) || [])
      .map(w => w.replace(/(?:wechat|weixin|wx)[:\s#@]*/i, '').trim())
      .filter(w => w.length >= 4)
  )];

  const urlMatch = text.match(/(?:www\.|https?:\/\/)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/);
  const website = urlMatch ? urlMatch[0] : undefined;

  return { emails, phones, whatsapp, wechat, website };
}

export function extractCompanyName(text: string, title: string): string {
  const patterns = [
    /(?:company|corp|ltd|inc|s\.a\.c|s\.a|sac|mining|quarry|stone|aggregate)[^\n,.(]{0,40}/gi,
    /[A-Z][A-Z\s&]{3,30}(?:LTD|INC|CORP|SAC|S\.A|MINING|QUARRY)/g,
  ];

  for (const pattern of patterns) {
    const match = (title + ' ' + text).match(pattern);
    if (match && match[0]) return match[0].trim().slice(0, 60);
  }

  return title.split(/[-|–]/)[0].trim().slice(0, 60);
}

export function detectCountry(text: string, fallback: string): string {
  const countryMap: Record<string, string[]> = {
    'Peru': ['peru', 'perú', 'lima', 'arequipa', '.pe'],
    'Indonesia': ['indonesia', 'jakarta', 'surabaya', '.id'],
    'Ghana': ['ghana', 'accra', '.gh'],
    'Mexico': ['mexico', 'méxico', 'cdmx', '.mx'],
    'Chile': ['chile', 'santiago', '.cl'],
    'Nigeria': ['nigeria', 'lagos', 'abuja', '.ng'],
    'South Africa': ['south africa', 'johannesburg', 'cape town', '.za'],
    'Philippines': ['philippines', 'manila', '.ph'],
    'Vietnam': ['vietnam', 'hanoi', 'ho chi minh', '.vn'],
    'Colombia': ['colombia', 'bogota', 'bogotá', '.co'],
  };

  const lower = text.toLowerCase();
  for (const [country, keywords] of Object.entries(countryMap)) {
    if (keywords.some(k => lower.includes(k))) return country;
  }
  return fallback;
}
