import { google } from 'googleapis'

// Initialize GoogleAuth client
const auth = new google.auth.GoogleAuth({
	keyFile: '/Users/donbe/Codes/mg_asin_scraping/aicontent.json', //'/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
	scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
})

// Create a new Google Sheets API instance
const sheets = google.sheets({ version: 'v4', auth })

async function getAsinEditor(): Promise<string[] | undefined> {
	try {
		const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8'
		// ステータス列(F列)も含めた範囲を指定
		const range = '手動URL!C3:F'

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range
		})

		const values = response.data.values
		if (!values) {
			console.log('No data found.')
			return
		}

		const urlArray: string[] = []

		values.forEach((row) => {
			const url = row[0] // URLを取得
			const status = row[3] // F列のステータスを取得

			// URLが有効で、かつステータスが「済」でない場合に配列に追加
			if (typeof url === 'string' && url.startsWith('https://') && status !== '済') {
				urlArray.push(url)
			}
		})

		console.log(urlArray)
		return urlArray // 条件を満たすURLの配列を返す
	} catch (error) {
		console.error('Error:', error)
		return
	}
}

export default getAsinEditor
