import fs from 'fs';
import path from 'path';

/**
 * Optional PDF report generator.
 * Requires 'puppeteer' dev dependency. If absent, exits gracefully.
 */
async function main() {
  const outDir = path.join(process.cwd(), 'audit', 'out');
  const htmlPath = path.join(outDir, 'report.html');
  if (!fs.existsSync(htmlPath)) {
    
    process.exit(1);
  }
  let puppeteer: any;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.warn('puppeteer yüklü değil; PDF oluşturma atlanıyor');
    return;
  }
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath.replace(/\\/g, '/'));
    await page.pdf({ path: path.join(outDir, 'report.pdf'), format: 'A4', printBackground: true });
    
  } finally {
    await browser.close();
  }
}
main();
