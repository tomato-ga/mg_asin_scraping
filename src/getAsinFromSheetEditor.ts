import { google } from 'googleapis'

// Create a new JWT client using the credentials
// Initialize GoogleAuth client
const auth = new google.auth.GoogleAuth({
	keyFile: '/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})

// Create a new Google Sheets API instance
const sheets = google.sheets({ version: 'v4', auth })

async function getAsinEditor(): Promise<string[] | undefined> {
	try {
		// Your spreadsheet ID
		const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
		// Specify the range or sheet from which you want to retrieve data
		const range = '手動URL!C3:C' // Adjust as needed for your specific sheet and range

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range
		})

		const values = response.data.values
		if (!values) {
			console.log('No data found.')
			return // ここで undefined を返す
		}

		const urlArray: string[] = []

		values.forEach((row) => {
			const url = row[0] // URLを取得

			if (typeof url === 'string' && url.startsWith('https://')) {
				urlArray.push(url) // 条件を満たすURLを配列に追加
			}
		})

		if (!values.length) {
			console.log('No data found.')
			return // ここで undefined を返す
		}

		console.log(urlArray)
		return urlArray // URLの配列を返す
	} catch (error) {
		console.error('Error:', error)
		return // ここでも undefined を返す
	}
}

export default getAsinEditor
