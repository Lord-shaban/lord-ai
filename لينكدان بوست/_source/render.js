// Render HTML files to high-res PNGs using system Chrome via puppeteer-core.
// Usage: node render.js <in.html> <out.png> <width> <height>
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const [,, inFile, outFile, wStr, hStr] = process.argv;
  const width = parseInt(wStr, 10);
  const height = parseInt(hStr, 10);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  const url = 'file:///' + path.resolve(inFile).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  // Ensure fonts are fully loaded before capture
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: outFile, type: 'png' });
  await browser.close();
  console.log('OK ' + outFile + ' (' + (width*2) + 'x' + (height*2) + ')');
})().catch(e => { console.error(e); process.exit(1); });
