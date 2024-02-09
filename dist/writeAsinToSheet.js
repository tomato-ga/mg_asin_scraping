"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
require('dotenv').config();
// Initialize GoogleAuth client
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: '/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json', // サービスアカウントキーファイルのパス
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] // 必要なスコープ
});
// Create a new Google Sheets API instance
const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
async function writeSheet(result, rowIndex) {
    const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8';
    const range = `手動URL!D${rowIndex}:E${rowIndex}`;
    const values = [[result.temp2Result, result.temp1Result]];
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
            values
        }
    });
    console.log('Sheet updated successfully.');
}
exports.default = writeSheet;
//# sourceMappingURL=writeAsinToSheet.js.map