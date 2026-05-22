const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Wait a bit for the server to start
  await new Promise(r => setTimeout(r, 4000));

  await page.goto('http://localhost:4446');
  await page.waitForTimeout(4000);

  await page.screenshot({ path: '/home/jules/verification/index_light.png', fullPage: true });

  await page.click('button[aria-label="Toggle Dark Mode"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/index_dark.png', fullPage: true });

  await browser.close();
})();
