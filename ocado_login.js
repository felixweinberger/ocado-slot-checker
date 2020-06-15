const puppeteer = require('puppeteer');
const cron = require('node-cron');
const notifier = require('node-notifier');
const fs = require('fs-extra');

(async () => {
  const page = await loadBrowserPage()
  goToLogin(page)
})()

async function goToLogin(page) {
  try {
    await page.goto('https://www.ocado.com', {waitUntil: 'networkidle2'});
    await page.setViewport({ width: 1280, height: 1200});
    setTimeout(() => {
      writeCookies(page, path.join(__dirname, 'cookies.json'))
    }, 120000)
  } catch (err) {
    console.log("check available slots error", err);
  }
};

async function loadBrowserPage() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    return page
  } catch (err) {
    console.log("prepare browser error", err);
  }
}

async function writeCookies(page, cookiesPath) {
  try {
    const client = await page.target().createCDPSession();
    const cookies = (await client.send("Network.getAllCookies"))["cookies"];
    console.log("Saving", cookies.length, "cookies");
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
  } catch (err) {
    console.log("write cookie error");
  }
}
