import { google } from 'googleapis'
require('dotenv').config()

// Initialize GoogleAuth client
const auth = new google.auth.GoogleAuth({
	keyFile: '/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})

// Create a new Google Sheets API instance
const sheets = google.sheets({ version: 'v4', auth })

interface Result {
	temp1Result: string
	temp2Result: string
}

async function writeSheet(result: Result, rowIndex: number): Promise<void> {
	const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
	const range = `手動URL!D${rowIndex}:E${rowIndex}`
	const values = [[result.temp2Result, result.temp1Result]]

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range,
		valueInputOption: 'RAW',
		requestBody: {
			values
		}
	})

	console.log('Sheet updated successfully.')
}

export default writeSheet
