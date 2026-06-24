import { chromium, Browser, Page } from 'playwright';

export async function createBrowser(): Promise<Browser> {
  return await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

export async function randomDelay(base: number, jitter: number = 1000): Promise<void> {
  const delay = base + Math.random() * jitter;
  await new Promise(resolve => setTimeout(resolve, delay));
}

export async function getPageText(page: Page, url: string): Promise<string> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await randomDelay(1500, 1000);
    return await page.evaluate(() => document.body.innerText || '');
  } catch {
    return '';
  }
}
