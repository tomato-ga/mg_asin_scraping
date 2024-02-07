import { chromium, ChromiumBrowser, Page } from '@playwright/test'
import getAsin from './getAsinFromSheet'

require('dotenv').config()

const userAgentString: string =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'

class Browser {
	browser: ChromiumBrowser | null = null
	page: Page | null = null

	public salePageHrefs: { [key: number]: string } = {}
	public saledpUrls: string[] = []
	public saledealUrls: string[] = []

	async launchBrowser(): Promise<void> {
		try {
			this.browser = await chromium.launch({
				channel: 'chrome',
				headless: true // ヘッドレスモードでブラウザを起動
			})
		} catch (e) {
			console.error(e) // エラーが発生した場合、エラーメッセージを出力
		}
	}

	async gotoAmazonProductPage(asins: string[]): Promise<void> {
		if (!this.browser) {
			console.error('Browserが初期化されていません')
			return
		}

		console.log('ブラウザ起動')
		this.page = await this.browser.newPage({
			// userAgentの設定を一時的にコメントアウトして、デフォルトのUser Agentを使用する
			// userAgent: userAgentString
		})

		for (const asin of asins) {
			const url = `https://www.amazon.co.jp/dp/${asin}`
			console.log(`${url} : アクセススタート`)
			await this.page.goto(url, { waitUntil: 'domcontentloaded' }) // waitUntilオプションを'domcontentloaded'に変更

			console.log(`[INFO] ${asin}のページにアクセスしました`)
			// 商品名を取得するためのセレクタを更新し、代替のセレクタも考慮
			const productNameElement = this.page.locator('#productTitle, h1#title, .product-title-word-break')
			const productName = await productNameElement.textContent()
			if (productName) {
				console.log(`商品名: ${productName.trim()}`)
			} else {
				console.log(`[INFO] ${asin}のページにアクセスしましたが、商品名を取得できませんでした`)
			}
		}

		// 必要な情報の取得が完了したらブラウザを閉じる
		await this.browser.close()
	}

	// async extract(): Promise<void> {
	// 	if (this.page) {
	// 		const elements = await this.page.$$(salePageElements)
	// 		let count = Object.keys(this.salePageHrefs).length // 既存のURL数からカウント開始
	// 		for (let element of elements) {
	// 			const href = await element.getAttribute('href')
	// 			if (href) {
	// 				this.salePageHrefs[count] = href
	// 				count++
	// 			}
	// 		}
	// 	}
	// }

	async scrollPage(): Promise<void> {
		if (this.page) {
			await this.page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight)
			})
		}
	}
}

// MEMO ASINをブラウザーに入力してデータ取得する
// ASINのデータを取得してAmazonの商品ページにアクセスする例
;(async () => {
	const browser = new Browser()
	await browser.launchBrowser()

	const asinToUrlMap = await getAsin() // getAsinFromSheetの結果を取得
	if (asinToUrlMap) {
		const allAsins = Object.values(asinToUrlMap).flat() // 全てのASINをフラットな配列にする
		await browser.gotoAmazonProductPage(allAsins) // ASINに基づいてAmazonの商品ページにアクセス
	}

	// ブラウザの終了処理など
})()
