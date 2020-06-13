const puppeteer = require('puppeteer');

(async () => {
  // Configure browser
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--window-size=1920,1200",
      "--user-data-dir=/Users/felixweinberger/Library/Application Support/Google/Chrome/Default"
    ]
  });

  // Open browser and set window size
  const page = await browser.newPage();
  await page.goto('https://www.ocado.com/webshop/getAddressesForDelivery.do', {waitUntil: 'networkidle2'});
  await page.setViewport({ width: 1920, height: 1200});

  // Check if html contains
  const html = await page.content()
  const re = /sorry\, no slots available for the selected days./gi
  const hasSlots = !re.test(html)

  // Print out result
  console.log("hasSlots: ", hasSlots)

  // Clean up
  await browser.close()
})();
