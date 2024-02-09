import { chromium, ChromiumBrowser, Page } from '@playwright/test'
import getAsinEditor from './getAsinFromSheetEditor'
import { LLMgeminiRun } from './llmGen'
import writeSheet from './writeAsinToSheet'
import { google } from 'googleapis'
require('dotenv').config()

const auth = new google.auth.GoogleAuth({
	keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
})
const sheets = google.sheets({ version: 'v4', auth })

class Browser {
	browser: ChromiumBrowser | null = null
	page: Page | null = null

	async launchBrowser(): Promise<void> {
		this.browser = await chromium.launch({
			channel: 'chrome',
			headless: true
		})
	}

	async gotoAmazonProductPage(urls: string[]): Promise<void> {
		if (!this.browser) {
			console.error('Browserが初期化されていません')
			return
		}
		this.page = await this.browser.newPage({
			userAgent: 'your-user-agent-string-here'
		})
		await this.page.setViewportSize({ width: 1920, height: 1080 })

		for (let index = 0; index < urls.length; index++) {
			const url = urls[index]
			console.log(`${url} : アクセススタート`)
			await this.page.goto(url, { waitUntil: 'domcontentloaded' })
			const productNameElement = this.page.locator('h1#title')
			const productName = await productNameElement.textContent()
			const productFeaturebullet = await this.page.evaluate(() => {
				const featureElement = document.querySelector('div#feature-bullets')
				return featureElement ? featureElement.textContent?.trim() : ''
			})

			if (productName && productFeaturebullet) {
				const result = await LLMgeminiRun(productFeaturebullet)
				if (result) {
					await writeSheet(result, index + 3) // +3 because the URLs start from C3
				}
			} else {
				console.log(`[INFO] ${url}のページにアクセスしましたが、商品説明を取得できませんでした`)
			}
		}

		await this.browser.close()
	}
}

// Main.ts
;(async () => {
	const browser = new Browser()
	await browser.launchBrowser()
	const urls = await getAsinEditor()
	if (urls) {
		await browser.gotoAmazonProductPage(urls)
	}
})()
