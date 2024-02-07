import { google } from 'googleapis'
require('dotenv').config()

// Initialize GoogleAuth client
const auth = new google.auth.GoogleAuth({
	keyFile: '/Users/donbe/Codes/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})

// Create a new Google Sheets API instance
const sheets = google.sheets({ version: 'v4', auth })

interface Result {
	temp1Result: string
	temp2Result: string
}

async function writeSheet(result: Result): Promise<void> {
	try {
		// Your spreadsheet ID
		const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
		// Specify the range or sheet from which you want to retrieve data
		const range = 'Cluster1!T:U' // Adjust as needed for your specific sheet and range

		// スプレッドシートに書き込むデータ
		const values = [[result.temp1Result, result.temp2Result]]

		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range,
			valueInputOption: 'RAW', // RAWまたはUSER_ENTERED
			requestBody: {
				// requestBody に直接 values を渡します
				values
			}
		})

		console.log('Sheet updated successfully.')
	} catch (error) {
		console.error('Error:', error)
	}
}

export default writeSheet
