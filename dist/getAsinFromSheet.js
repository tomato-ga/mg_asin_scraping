"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
// Create a new JWT client using the credentials
// Initialize GoogleAuth client
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: '/Users/donbe/Codes/mg_asin_scraping/aicontent.json', //'/Users/donbe/Codes/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
});
// Create a new Google Sheets API instance
const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
async function getAsin() {
    try {
        // Your spreadsheet ID
        const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8';
        // Specify the range or sheet from which you want to retrieve data
        const range = 'Cluster1!R:S'; // Adjust as needed for your specific sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        const values = response.data.values;
        if (!values) {
            console.log('No data found.');
            return; // ここで undefined を返す
        }
        console.log('Data from the entire sheet:');
        const urlToAsinMap = {};
        values.forEach((row) => {
            const url = row[0]; // URLを取得
            const asinList = row[1]; // ASINリストを取得
            if (typeof url === 'string' && url.startsWith('https://') && asinList) {
                const asins = asinList
                    .split(',')
                    .map((asin) => asin.trim())
                    .filter((asin) => asin !== '');
                if (!urlToAsinMap[url]) {
                    urlToAsinMap[url] = new Set(); // 新しいURLの場合は、空のSetを初期値として設定
                }
                asins.forEach((asin) => urlToAsinMap[url].add(asin)); // URLに対応するASINをSetに追加
            }
        });
        // Setを配列に変換
        const urlToAsinArrayMap = {};
        Object.keys(urlToAsinMap).forEach((url) => {
            urlToAsinArrayMap[url] = Array.from(urlToAsinMap[url]);
        });
        console.log('URL to ASIN Mappings:', urlToAsinArrayMap);
        return urlToAsinArrayMap;
    }
    catch (error) {
        console.error('Error:', error);
        return; // ここでも undefined を返す
    }
}
exports.default = getAsin;
//# sourceMappingURL=getAsinFromSheet.js.map