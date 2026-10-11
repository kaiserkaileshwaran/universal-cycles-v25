const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false // See what's going on
  });
  // Note: we can't do this easily because Chrome is missing in this headless runner.
})();
