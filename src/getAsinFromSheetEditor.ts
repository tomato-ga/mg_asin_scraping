import { google } from 'googleapis'

// Initialize GoogleAuth client
const auth = new google.auth.GoogleAuth({
	keyFile: '/Users/donbe/Codes/mg_asin_scraping/aicontent.json', //'/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})

// Create a new Google Sheets API instance
const sheets = google.sheets({ version: 'v4', auth })

export interface URLRow {
	url: string
	rowIndex: number
}

async function getAsinEditor(): Promise<URLRow[] | undefined> {
	try {
		const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
		// Include the row index in the data fetched
		const range = '手動URL!B3:F'

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range
		})

		const values = response.data.values
		if (!values) {
			console.log('No data found.')
			return
		}

		const urlRows: URLRow[] = []

		values.forEach((row, index) => {
			const url = row[1] // Adjusted for zero-based index, URL is now in second column (C)
			const status = row[4] // Status is in the fifth column (F), zero-based index

			// URL is valid and status is not "済", include the original sheet row number (index + offset from header rows)
			if (typeof url === 'string' && url.startsWith('https://') && status !== '済') {
				urlRows.push({ url, rowIndex: index + 3 }) // Adjust the offset if your range start changes
			}
		})

		console.log(urlRows)
		return urlRows // Returns an array of URLRow, each containing a URL and its row index
	} catch (error) {
		console.error('Error:', error)
		return
	}
}

export default getAsinEditor
