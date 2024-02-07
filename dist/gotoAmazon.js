"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
require('dotenv').config();
const userAgentString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
const salePageElements = '';
const nextLinkSelector = '';
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
    async gotoAmazonSalePage() {
        if (!this.browser) {
            console.error('Browser初期化でエラーになりました');
            return;
        }
        this.page = await this.browser.newPage({ userAgent: userAgentString });
        await this.page.setViewportSize({ width: 1920, height: 2080 });
        await this.page.goto('https://www.amazon.co.jp');
        await this.page.waitForLoadState();
        const response = await this.page.goto('https://www.amazon.co.jp/gp/goldbox');
        await this.page.waitForTimeout(2000 + Math.random() * 1000);
        if (response && response.ok()) {
            console.log('セールページに移動しました');
            // MEMO 2ページ分の処理をループで行う
            for (let i = 0; i < 1; i++) {
                // 現在のページでスクロール
                await this.scrollPage();
                await this.page.waitForSelector(salePageElements, { state: 'visible' });
                await this.page.waitForTimeout(3000 + Math.random() * 1000);
                // 現在のページからhrefを取得
                await this.extract();
                console.log(`${i + 1}ページ目保存したhref`, Object.keys(this.salePageHrefs).length);
            }
        }
        else {
            console.error('セールページに移動できませんでした');
        }
    }
    async extract() {
        if (this.page) {
            const elements = await this.page.$$(salePageElements);
            let count = Object.keys(this.salePageHrefs).length; // 既存のURL数からカウント開始
            for (let element of elements) {
                const href = await element.getAttribute('href');
                if (href) {
                    this.salePageHrefs[count] = href;
                    count++;
                }
            }
        }
    }
    async scrollPage() {
        if (this.page) {
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
        }
    }
}
//# sourceMappingURL=gotoAmazon.js.map