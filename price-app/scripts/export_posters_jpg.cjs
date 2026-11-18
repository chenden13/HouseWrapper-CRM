const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUTPUT_DIR_1 = path.resolve(__dirname, '../price_sheets_jpg');
const OUTPUT_DIR_2 = path.resolve(__dirname, '../public/price_sheets_jpg');

[OUTPUT_DIR_1, OUTPUT_DIR_2].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,1400'],
    defaultViewport: { width: 1400, height: 1400, deviceScaleFactor: 2 } // 2x high resolution
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5173/?export=1&view=priceSheet ...');
  await page.goto('http://localhost:5173/?export=1&view=priceSheet', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const sheetTypes = [
    { testid: 'tab-ppf', prefix: '犀牛皮價目表' },
    { testid: 'tab-wrap', prefix: '改色價目表' }
  ];

  const sizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const st of sheetTypes) {
    console.log(`\n=== Switching to ${st.prefix} ===`);
    await page.waitForSelector(`[data-testid="${st.testid}"]`);
    await page.click(`[data-testid="${st.testid}"]`);
    await new Promise(r => setTimeout(r, 500));

    for (const size of sizes) {
      console.log(`Selecting size ${size}...`);
      await page.waitForSelector(`[data-testid="size-${size}"]`);
      await page.click(`[data-testid="size-${size}"]`);
      await new Promise(r => setTimeout(r, 400));

      // 等待海報元素
      await page.waitForSelector('#price-poster-canvas');
      const posterElement = await page.$('#price-poster-canvas');
      
      const filename = `${st.prefix}_${size}尺寸.jpg`;
      const file1 = path.join(OUTPUT_DIR_1, filename);
      const file2 = path.join(OUTPUT_DIR_2, filename);

      await posterElement.screenshot({
        path: file1,
        type: 'jpeg',
        quality: 95
      });

      fs.copyFileSync(file1, file2);
      const sizeBytes = fs.statSync(file1).size;
      console.log(`Saved: ${filename} (${sizeBytes} bytes)`);
    }
  }

  await browser.close();
  console.log('\nAll 10 price sheet JPG posters generated successfully!');
}

run().catch(err => {
  console.error('Error generating posters:', err);
  process.exit(1);
});
