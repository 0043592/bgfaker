// https://www.tabnine.com/code/javascript/functions/puppeteer/Page/click
const Xvfb = require('xvfb');
const puppeteer = require('puppeteer-extra');
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const stealth = StealthPlugin()
stealth.enabledEvasions.delete('user-agent-override')

const UserPreferences = require('puppeteer-extra-plugin-user-preferences')
const preferences = UserPreferences()
puppeteer.use(stealth);
puppeteer.use(preferences)

;(async () => {
    var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
    });
    xvfb.start((err) => {
        if (err) console.error(err)
    })
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, //otherwise it defaults to 800x600
        ignoreHTTPSErrors: true,
        args: [
            '--no-sandbox',
            '--single-process',
            '--no-zygote',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--blink-settings=imagesEnabled=true',
            "--disable-gpu",
            "--disable-dev-shm-usage",
            '--no-first-run',
            '--start-fullscreen',
            '--display=' + xvfb._display
        ]
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', interceptedRequest => {
        console.log(interceptedRequest.url())
        if (interceptedRequest.url().includes('_/lookup/accountlookup')) {
            console.log(interceptedRequest.postData())
            interceptedRequest.abort();
        } else
            interceptedRequest.continue();
    });

    const pageLoadOptions = {
        timeout: 10000,
        waitUntil: ['domcontentloaded', 'networkidle0']
    };
    await page.goto('https://accounts.google.com/ServiceLogin?flowName=GlifWebSignIn&flowEntry=ServiceLogin&hl=en&Email=romanus',
        pageLoadOptions);
    await page.screenshot({path: '../.cache/screenshot_1.png'});
    await Promise.all([
        page.waitForNavigation({waitUntil: 'domcontentloaded'}),
        page.waitForNavigation({waitUntil: 'load'}),
        page.waitForSelector('input[type="email"]', {visible: true}),
        page.screenshot({path: '../.cache/screenshot_2.png'}),
        page.click('#identifierNext')
    ]);
    await page.screenshot({path: '../.cache/screenshot_3.png'});
    await browser.close();
    xvfb.stop();
    console.log('Browser Close!')
})();
