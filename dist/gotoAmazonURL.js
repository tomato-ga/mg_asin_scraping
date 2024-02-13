"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const getAsinFromSheetEditor_1 = __importDefault(require("./getAsinFromSheetEditor"));
const llmGen_1 = require("./llmGen");
const writeAsinToSheet_1 = __importDefault(require("./writeAsinToSheet"));
const googleapis_1 = require("googleapis");
require('dotenv').config();
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
const userAgentString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
class Browser {
    constructor() {
        this.browser = null;
        this.page = null;
    }
    async launchBrowser() {
        this.browser = await test_1.chromium.launch({
            channel: 'chrome',
            headless: true
        });
    }
    async gotoAmazonProductPage(urls) {
        if (!this.browser) {
            console.error('Browserが初期化されていません');
            return;
        }
        this.page = await this.browser.newPage({
            userAgent: userAgentString
        });
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        for (let index = 0; index < urls.length; index++) {
            const url = urls[index];
            console.log(`${url} : アクセススタート`);
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });
            const productNameElement = this.page.locator('h1#title');
            const productName = await productNameElement.textContent();
            const productFeaturebullet = await this.page.evaluate(() => {
                var _a;
                const featureElement = document.querySelector('div#feature-bullets');
                return featureElement ? (_a = featureElement.textContent) === null || _a === void 0 ? void 0 : _a.trim() : '';
            });
            if (productName && productFeaturebullet) {
                const result = await (0, llmGen_1.LLMgeminiRun)(productFeaturebullet);
                if (result) {
                    await (0, writeAsinToSheet_1.default)(result, index + 3); // +3 because the URLs start from C3
                }
            }
            else {
                console.log(`[INFO] ${url}のページにアクセスしましたが、商品説明を取得できませんでした`);
            }
        }
        await this.browser.close();
    }
}
// Main.ts
;
(async () => {
    const browser = new Browser();
    await browser.launchBrowser();
    const urls = await (0, getAsinFromSheetEditor_1.default)();
    if (urls) {
        await browser.gotoAmazonProductPage(urls);
    }
})();
//# sourceMappingURL=gotoAmazonURL.js.map