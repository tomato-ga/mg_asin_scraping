import { chromium, ChromiumBrowser, Page } from '@playwright/test'
import getAsinEditor, { URLRow } from './getAsinFromSheetEditor' // Ensure URLRow is exported
import { LLMgeminiRun } from './llmGen'
import writeSheet from './writeAsinToSheet'
import { google } from 'googleapis'
require('dotenv').config()

const auth = new google.auth.GoogleAuth({
	keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
})
const sheets = google.sheets({ version: 'v4', auth })

const userAgentString: string =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'

class Browser {
	browser: ChromiumBrowser | null = null
	page: Page | null = null

	async launchBrowser(): Promise<void> {
		this.browser = await chromium.launch({
			channel: 'chrome',
			headless: true
		})
	}

	async gotoAmazonProductPage(urlRows: URLRow[]): Promise<void> {
		// Accept an array of URLRow objects
		if (!this.browser) {
			console.error('Browserが初期化されていません')
			return
		}
		this.page = await this.browser.newPage({
			userAgent: userAgentString
		})
		await this.page.setViewportSize({ width: 1920, height: 1080 })

		for (const urlRow of urlRows) {
			// Iterate through URLRow objects
			const url = urlRow.url // Extract URL from the URLRow object
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
					await writeSheet(result, urlRow.rowIndex) // Use rowIndex from URLRow
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
	const urlRows = await getAsinEditor() // This now expects URLRow objects
	if (urlRows) {
		await browser.gotoAmazonProductPage(urlRows) // Pass URLRow objects
	}
})()
