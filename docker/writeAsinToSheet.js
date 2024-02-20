'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const googleapis_1 = require('googleapis')
require('dotenv').config()
// Initialize GoogleAuth client
const auth = new googleapis_1.google.auth.GoogleAuth({
	keyFile: './aicontent.json', //'/Users/donbe/Codes/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})
// Create a new Google Sheets API instance
const sheets = googleapis_1.google.sheets({ version: 'v4', auth })
async function writeSheet(result, rowIndex) {
	console.log('rowIndex: ', rowIndex)
	const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
	// データを書き込む範囲
	const dataRange = `手動URL!D${rowIndex}:E${rowIndex}`
	const values = [[result.temp2Result, result.temp1Result]]
	// ステータスを更新する範囲
	const statusRange = `手動URL!F${rowIndex}`
	try {
		// データを書き込む
		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: dataRange,
			valueInputOption: 'RAW',
			requestBody: {
				values
			}
		})
		// ステータス列に「済」を書き込む
		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: statusRange,
			valueInputOption: 'RAW',
			requestBody: {
				values: [['済']]
			}
		})
		console.log('Sheet updated successfully.')
	} catch (error) {
		console.error('Error:', error)
	}
}
exports.default = writeSheet
//# sourceMappingURL=writeAsinToSheet.js.map
