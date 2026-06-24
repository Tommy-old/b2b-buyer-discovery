export interface EmailDraft {
  to: string;
  subject: string;
  bodyText: string;
  language: 'es' | 'en';
}

export interface LeadEmailContext {
  companyName: string;
  market: string;
  productMatch: string;
  needsIdentified: string;
  intentScore: number;
}

const SPANISH_MARKETS = new Set([
  'Peru', 'Chile', 'Colombia', 'Mexico', 'México',
  'Bolivia', 'Ecuador', 'Venezuela', 'Argentina',
]);

const LATIN_PRODUCT_WORDS = /trituradora|mandíbula|cono|molino|chancadora|zaranda/i;

export function detectLanguage(market: string): 'es' | 'en' {
  return SPANISH_MARKETS.has(market) ? 'es' : 'en';
}

function buildSignature(lang: 'es' | 'en'): string {
  const wa  = process.env.MAIL_WHATSAPP || '+8616651869961';
  const web = process.env.MAIL_WEBSITE  || 'www.minasc.com.es';
  const name = lang === 'es'
    ? 'MINA SC – Maquinaria Industrial para Minería'
    : 'MINA SC – Industrial Machinery for Mining';
  return `Linda\n${name}\nWhatsApp: ${wa}\nWeb: ${web}`;
}

const INVENTORY: Record<'es'|'en', string> = {
  es: `• Trituradora de mandíbula PE600×900 (alimentación máx. 500 mm, capacidad 50–180 t/h)
• Trituradora de cono Symons (fina/media/gruesa, capacidad 36–600 t/h)`,
  en: `• PE600×900 jaw crusher (max feed 500 mm, capacity 50–180 t/h)
• Symons cone crusher (fine/medium/coarse, capacity 36–600 t/h)`,
};

function cleanProduct(raw: string, lang: 'es' | 'en'): string {
  if (!raw || raw.toLowerCase() === 'unknown') {
    return lang === 'es' ? 'equipo de trituración' : 'crushing equipment';
  }
  // 英语邮件里不能出现西班牙语词
  if (lang === 'en' && LATIN_PRODUCT_WORDS.test(raw)) {
    return 'crushing equipment';
  }
  return raw;
}

function buildSubjectEs(ctx: LeadEmailContext): string {
  const product = cleanProduct(ctx.productMatch, 'es');
  return `Oferta: ${product} disponible para entrega inmediata – MINA SC`;
}

function buildSubjectEn(ctx: LeadEmailContext): string {
  const product = cleanProduct(ctx.productMatch, 'en');
  return `In-stock offer: ${product} – ready to ship | MINA SC`;
}

function buildBodyEs(ctx: LeadEmailContext): string {
  const company = (ctx.companyName && ctx.companyName !== 'Unknown')
    ? ctx.companyName : 'su empresa';
  const needs = ctx.needsIdentified || cleanProduct(ctx.productMatch, 'es');

  return `Estimado equipo de ${company},

Me pongo en contacto desde MINA SC, especialistas en maquinaria para minería y canteras.

Hemos identificado que ${company} opera en el sector minero en ${ctx.market} y podría estar evaluando soluciones para ${needs}. Por ello, me permito compartirles nuestra disponibilidad de stock actual:

${INVENTORY.es}

Ambos equipos están disponibles para envío inmediato, con documentación técnica completa y soporte post-venta. Ofrecemos precios competitivos FOB y podemos coordinar el transporte hasta su destino.

¿Le gustaría recibir nuestra cotización detallada o las fichas técnicas? Podemos agendar una llamada esta semana a su conveniencia.

Quedo a su entera disposición.

Saludos cordiales,
${buildSignature('es')}`;
}

function buildBodyEn(ctx: LeadEmailContext): string {
  const company = (ctx.companyName && ctx.companyName !== 'Unknown')
    ? ctx.companyName : 'your company';
  const needs = ctx.needsIdentified || cleanProduct(ctx.productMatch, 'en');

  return `Dear ${company} team,

I'm reaching out from MINA SC, a specialist supplier of mining and quarry machinery.

We noticed that ${company} is active in the mining sector in ${ctx.market} and may be evaluating options for ${needs}. I wanted to share our current in-stock availability:

${INVENTORY.en}

Both units are ready to ship immediately, with full technical documentation and after-sales support. We offer competitive FOB pricing and can arrange freight to your destination.

Would you like a detailed quotation or technical datasheets? We're happy to schedule a call this week at your convenience.

Looking forward to hearing from you.

Best regards,
${buildSignature('en')}`;
}

export function composeEmail(ctx: LeadEmailContext, toEmail: string): EmailDraft {
  const lang = detectLanguage(ctx.market);
  return {
    to: toEmail,
    subject: lang === 'es' ? buildSubjectEs(ctx) : buildSubjectEn(ctx),
    bodyText: lang === 'es' ? buildBodyEs(ctx) : buildBodyEn(ctx),
    language: lang,
  };
}

export function composeEmailsForLeads(
  leads: LeadEmailContext[],
  emails: string[],
  minScore: number = 7
): EmailDraft[] {
  const drafts: EmailDraft[] = [];
  for (let i = 0; i < leads.length; i++) {
    if (leads[i].intentScore < minScore) continue;
    if (!emails[i]) continue;
    drafts.push(composeEmail(leads[i], emails[i]));
  }
  return drafts;
}
