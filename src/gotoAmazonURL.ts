import { chromium, ChromiumBrowser, Page } from '@playwright/test'
import getAsinEditor from './getAsinFromSheetEditor'
import { LLMgeminiRun } from './llmGen'
import writeSheet from './writeAsinToSheet'

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

	// TODO シートからURL読み込んで、
	// TODO classのgotoAmazonProductPageにasinを渡すだけで商品説明を読み込んでAI生成できるようにする

	async gotoAmazonProductPage(urls: string[]): Promise<void> {
		if (!this.browser) {
			console.error('Browserが初期化されていません')
			return
		}

		console.log('ブラウザ起動')
		this.page = await this.browser.newPage({
			// userAgentの設定を一時的にコメントアウトして、デフォルトのUser Agentを使用する
			userAgent: userAgentString
		})

		await this.page.setViewportSize({ width: 1920, height: 2080 })

		for (const url of urls) {
			// const url = `https://www.amazon.co.jp/dp/${asin}`
			console.log(`${url} : アクセススタート`)
			await this.page.goto(url, { waitUntil: 'domcontentloaded' }) // waitUntilオプションを'domcontentloaded'に変更
			await this.page.waitForLoadState()

			console.log(`[INFO] ${url}のページにアクセスしました`)
			// 商品名を取得するためのセレクタを更新し、代替のセレクタも考慮
			const productNameElement = this.page.locator('h1#title')
			const productName = await productNameElement.textContent()

			const productFeaturebullet = await this.page.evaluate(() => {
				const featureElement = document.querySelector('div#feature-bullets')
				return featureElement ? featureElement.textContent?.trim() : ''
			})

			const productDescriptionText = await this.page.evaluate(() => {
				const descripElement = document.querySelector('div#productDescription')
				return descripElement ? descripElement.textContent?.trim() : ''
			})

			if (productName && productFeaturebullet) {
				console.log(`商品説明: ${productFeaturebullet}`)
				const result = await LLMgeminiRun(productFeaturebullet)
				console.log('llmresult', result)

				if (result) {
					console.log(result)
					// await writeSheet(result)
				}
			} else {
				console.log(`[INFO] ${url}のページにアクセスしましたが、商品説明を取得できませんでした`)
			}
		}

		// 必要な情報の取得が完了したらブラウザを閉じる
		await this.browser.close()
	}

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

	const Url = await getAsinEditor() // getAsinFromSheetの結果を取得
	if (Url) {
		const allUrls = Object.values(Url).flat() // 全てのASINをフラットな配列にする
		await browser.gotoAmazonProductPage(allUrls) // ASINに基づいてAmazonの商品ページにアクセス
	}

	// ブラウザの終了処理など
})()
