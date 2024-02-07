"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
// Load the credentials from the service account key file
const credentials = require('/Users/ore/Documents/GitHub/mg_asin_scraping/aicontent.json');
// Create a new JWT client using the credentials
const client = new google_auth_library_1.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
// Authorize and create a Google Sheets API instance
const sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
async function main() {
    try {
        // Your spreadsheet ID
        const spreadsheetId = '1nx467L8lBrlAXeOOQX5jFJxxoiAAjhyT0MHLKVak0h8';
        // Read data from the entire spreadsheet
        // Specify the sheet name if you want to retrieve data from a specific sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Cluster1' // Leave blank or specify a sheet name for the entire sheet, e.g., 'Sheet1'
        });
        const values = response.data.values;
        if (!values) {
            console.log('No data found.');
        }
        else {
            console.log('Data from the entire sheet:');
            values.forEach((row) => {
                console.log(row.join('\t'));
            });
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main();
//# sourceMappingURL=getAsinFromSheet.js.map