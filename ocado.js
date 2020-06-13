const puppeteer = require('puppeteer');
const cron = require('node-cron');
const notifier = require('node-notifier');
const fs = require('fs-extra');

(async () => {
  const page = await loadBrowserPage()
  // console.log(page)
  checkSlotsAndNotify(page)
  cron.schedule('*/1 * * * *', () => checkSlotsAndNotify(page))
})()

async function checkSlotsAndNotify(page) {
  try {
    const {
      hasSlotsAvailable,
      isDeliverySlotPage
    } = await checkAvailableSlots(page);

    const now = new Date();
    const dateString = now.toLocaleDateString('en-GB', {day: 'numeric', month:'short', weekday: 'short'});
    const timeString = now.toLocaleTimeString('en-GB');
    const dateTimeString = '[' + dateString + ' ' + timeString + ']';

    if (!isDeliverySlotPage) {
      console.log(dateTimeString + " 🤬 You were logged out of Ocado! Run chrome in GUI mode, login, and restart the Ocado checker.")
      notifier.notify({
        title: "Ocado checker",
        sound: true,
        message: "🤬 You were logged out of Ocado!"
      });
      return;
    }

    if (hasSlotsAvailable) {
      console.log(dateTimeString + " 😱 Slots available! Check https://www.ocado.com/webshop/getAddressesForDelivery.do right now!");
      notifier.notify({
        title: "Ocado checker",
        sound: true,
        open: "https://www.ocado.com/webshop/getAddressesForDelivery.do",
        message: "😱 Slots available!"
      });
      return
    } 

    console.log(dateTimeString + " 😭 No slots available.");
    return;
  } catch (err) {
    console.log("check slots and notify error");
  }
}

async function checkAvailableSlots(page) {
  try {
    await page.goto('https://www.ocado.com/webshop/getAddressesForDelivery.do', {waitUntil: 'networkidle2'});
    await page.setViewport({ width: 1920, height: 1200});
    const html = await page.content();
    const isDeliverySlotPage = /choose a slot/gi.test(html);
    const hasSlotsAvailable = !/sorry\, no slots available for the selected days./gi.test(html) && isDeliverySlotPage;

    return {
      isDeliverySlotPage,
      hasSlotsAvailable
    };
  } catch (err) {
    console.log("check available slots error", err);
  }
};

async function loadBrowserPage() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await restoreCookies(page, 'cookies.json')
    return page
  } catch (err) {
    console.log("prepare browser error", err);
  }
}

async function writeCookies(page, cookiesPath) {
  try {
    const client = await page.target().createCDPSession();
    // This gets all cookies from all URLs, not just the current URL
    const cookies = (await client.send("Network.getAllCookies"))["cookies"];

    console.log("Saving", cookies.length, "cookies");
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
  } catch (err) {
    console.log("write cookie error");
  }
}

async function restoreCookies(page, cookiesPath) {
  try {
    // const cookies = await fs.readJSON(cookiesPath);
    let buf = fs.readFileSync(cookiesPath);
    let cookies = JSON.parse(buf);
    console.log("Loading", cookies.length, "cookies into browser");
    await page.setCookie(...cookies);
    return
  } catch (err) {
    console.log("restore cookie error", err);
    return
  }
}
