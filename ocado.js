const puppeteer = require('puppeteer');
const cron = require('node-cron');
const notifier = require('node-notifier');

checkSlotsAndNotify()
cron.schedule('*/1 * * * *', checkSlotsAndNotify)

async function checkSlotsAndNotify() {
  const {
    hasSlotsAvailable,
    isDeliverySlotPage
  } = await checkAvailableSlots();

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
}

async function checkAvailableSlots() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    userDataDir: "./user_data",
    args: [
      "--window-size=1920,1200",
    ]
  });

  const page = await browser.newPage();
  await page.goto('https://www.ocado.com/webshop/getAddressesForDelivery.do', {waitUntil: 'networkidle2'});
  await page.setViewport({ width: 1920, height: 1200});

  const html = await page.content();
  const isDeliverySlotPage = /choose a slot/gi.test(html);
  const hasSlotsAvailable = !/sorry\, no slots available for the selected days./gi.test(html) && isDeliverySlotPage;

  return {
    isDeliverySlotPage,
    hasSlotsAvailable
  };
};
