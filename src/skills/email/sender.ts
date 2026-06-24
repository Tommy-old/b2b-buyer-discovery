import nodemailer from 'nodemailer';
import { EmailDraft } from './composer';
import { logger } from '../../core/logger';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST  || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export interface SendResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

// dryRun=true → 只记录日志，不真正发送（默认 true，直到明确传 false）
export async function sendEmails(
  drafts: EmailDraft[],
  dryRun: boolean = true
): Promise<SendResult[]> {
  const fromName  = process.env.MAIL_FROM_NAME  || 'Linda - MINA SC';
  const fromAddr  = process.env.MAIL_FROM_ADDR  || process.env.SMTP_USER || '';
  const delayMs   = Number(process.env.MAIL_DELAY_MS) || 3000;
  const results: SendResult[] = [];

  if (dryRun) {
    logger.info(`[EMAIL DRY-RUN] Would send ${drafts.length} email(s) — set dryRun=false to actually send`);
    for (const d of drafts) {
      logger.info(`  → ${d.to} | [${d.language.toUpperCase()}] ${d.subject}`);
      results.push({ to: d.to, success: true });
    }
    return results;
  }

  const transport = createTransport();

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    try {
      const info = await transport.sendMail({
        from:    `"${fromName}" <${fromAddr}>`,
        to:      draft.to,
        subject: draft.subject,
        text:    draft.bodyText,
      });
      logger.info(`[EMAIL SENT ${i + 1}/${drafts.length}] ${draft.to} → messageId: ${info.messageId}`);
      results.push({ to: draft.to, success: true, messageId: info.messageId });
    } catch (err: any) {
      logger.error(`[EMAIL FAILED] ${draft.to}: ${err.message}`);
      results.push({ to: draft.to, success: false, error: err.message });
    }

    if (i < drafts.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return results;
}
