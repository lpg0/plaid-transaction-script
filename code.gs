function myFunction() {
var url = "https://development.plaid.com/transactions/get";
var data = {
"client_id": "62d56ae4200ab2001404a241",
"secret": "579163fc2e18aa7e91ae14a23b9934",
"access_token": "access-development-7d485e9d-d150-4d79-8fd5-53846c744b53",
"start_date": getStartDate(),
"end_date": getEndDate()
};
var options = {
"method" : "POST",
"contentType" : "application/json",
"payload" : JSON.stringify(data)
};

var response = UrlFetchApp.fetch(url, options);
const obj = JSON.parse(response.getContentText());

//parses the response and inserts the data into two sheets in the current active spreadsheet: "Balance" and "Transactions". 
//Then transactions are sorted by date in descending order, and any duplicate transactions are removed using the removeDuplicateRows() function.

var balanceSheet = SpreadsheetApp.getActive().getSheetByName("Balance");
balanceSheet.deleteRow(balanceSheet.getLastRow());
balanceSheet.appendRow(["Current Balance:", obj.accounts[0].balances.current]);

var transactionsSheet = SpreadsheetApp.getActive().getSheetByName("Transactions");
var data = obj.transactions.map(transaction => [transaction.date, transaction.name, transaction.amount, transaction.category, transaction.transaction_id]);
transactionsSheet.getRange(transactionsSheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
transactionsSheet.sort(1, false);
removeDuplicateRows("Transactions");
}

//used to generate the start and end dates for the transactions to be fetched. 
//The start date is determined by taking the current date and setting the month to the previous month, unless it is already January, in which case it is set to January. 
//The day of the month is set to the 28th unless the current day is already later than the 28th, in which case it is left unchanged. The end date is simply the current date.

function getStartDate() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  let s_mm = d.getMonth() + 1;
  if (s_mm === 12) {
    s_mm = 1;
  }
  const s_dd = d.getDate() > 28 ? 28 : d.getDate();
  const start_date = `${yyyy}-${s_mm.toString().padStart(2, "0")}-${s_dd.toString().padStart(2, "0")}`;
  return start_date;
}
function getEndDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function removeDuplicateRows(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var uniqueData = data.reduce((unique, transaction) => !unique.some(t => t[4] === transaction[4]) ? [...unique, transaction] : unique, []);
  sheet.clearContents();
  sheet.getRange(1, 1, uniqueData.length, uniqueData[0].length).setValues(uniqueData);
  sheet.sort(1, false);
}
