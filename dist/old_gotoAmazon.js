"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const getAsinFromSheet_1 = __importDefault(require("./getAsinFromSheet"));
const llmGen_1 = require("./llmGen");
require('dotenv').config();
const userAgentString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
class Browser {
    constructor() {
        this.browser = null;
        this.page = null;
        this.salePageHrefs = {};
        this.saledpUrls = [];
        this.saledealUrls = [];
    }
    async launchBrowser() {
        try {
            this.browser = await test_1.chromium.launch({
                channel: 'chrome',
                headless: true // ヘッドレスモードでブラウザを起動
            });
        }
        catch (e) {
            console.error(e); // エラーが発生した場合、エラーメッセージを出力
        }
    }
    // TODO シートからasin読み込んで、
    // TODO classのgotoAmazonProductPageにasinを渡すだけで商品説明を読み込んでAI生成できるようにする
    async gotoAmazonProductPage(asins) {
        if (!this.browser) {
            console.error('Browserが初期化されていません');
            return;
        }
        console.log('ブラウザ起動');
        this.page = await this.browser.newPage({
            // userAgentの設定を一時的にコメントアウトして、デフォルトのUser Agentを使用する
            userAgent: userAgentString
        });
        await this.page.setViewportSize({ width: 1920, height: 2080 });
        for (const asin of asins) {
            const url = `https://www.amazon.co.jp/dp/${asin}`;
            console.log(`${url} : アクセススタート`);
            await this.page.goto(url, { waitUntil: 'domcontentloaded' }); // waitUntilオプションを'domcontentloaded'に変更
            await this.page.waitForLoadState();
            console.log(`[INFO] ${asin}のページにアクセスしました`);
            // 商品名を取得するためのセレクタを更新し、代替のセレクタも考慮
            const productNameElement = this.page.locator('h1#title');
            const productName = await productNameElement.textContent();
            const productDescriptionText = await this.page.evaluate(() => {
                var _a;
                const descripElement = document.querySelector('div#productDescription');
                return descripElement ? (_a = descripElement.textContent) === null || _a === void 0 ? void 0 : _a.trim() : '';
            });
            if (productName && productDescriptionText) {
                console.log(`商品説明: ${productDescriptionText}`);
                const result = await (0, llmGen_1.LLMgeminiRun)(productDescriptionText);
                console.log('llmresult', result);
                if (result) {
                    // await writeSheet(result)
                }
            }
            else {
                console.log(`[INFO] ${asin}のページにアクセスしましたが、商品説明を取得できませんでした`);
            }
        }
        // 必要な情報の取得が完了したらブラウザを閉じる
        await this.browser.close();
    }
    async scrollPage() {
        if (this.page) {
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
        }
    }
}
// MEMO ASINをブラウザーに入力してデータ取得する
// ASINのデータを取得してAmazonの商品ページにアクセスする例
;
(async () => {
    const browser = new Browser();
    await browser.launchBrowser();
    const asinToUrlMap = await (0, getAsinFromSheet_1.default)(); // getAsinFromSheetの結果を取得
    if (asinToUrlMap) {
        const allAsins = Object.values(asinToUrlMap).flat(); // 全てのASINをフラットな配列にする
        await browser.gotoAmazonProductPage(allAsins); // ASINに基づいてAmazonの商品ページにアクセス
    }
    // ブラウザの終了処理など
})();
//# sourceMappingURL=old_gotoAmazon.js.map