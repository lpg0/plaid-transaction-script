function myFunction() {
  var data = {
    "client_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "access_token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "start_date": getStartDate(),
    "end_date": getEndDate()
  };
	
  var payload = JSON.stringify(data);
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
  };
	
  var url = "https://development.plaid.com/transactions/get";
  var response = UrlFetchApp.fetch(url, options);
  initializeSheet(response);
}

function initializeSheet(response) {
  var sheet = SpreadsheetApp.getActiveSheet();
  const obj = JSON.parse(response.getContentText());
	
  for (let i = 0; i < obj.transactions.length; i++) {
    sheet.appendRow([obj.transactions[i].date,obj.transactions[i].amount,obj.transactions[i].name]);
  }
}

function updateSheet(response) {
  var sheet = SpreadsheetApp.getActiveSheet();
  const obj = JSON.parse(response.getContentText());
	
  for (let i = obj.transactions.length-1; i >= 0; i--) {
    sheet.appendRow([obj.transactions[i].date,obj.transactions[i].amount,obj.transactions[i].name]);
  }
}

function getStartDate(){
  const d = new Date();
  var yyyy = String(d.getFullYear());
  var s_mm = d.getMonth();
	
  if (s_mm == 0) {
    s_mm = "12"
  } else {
    s_mm = String(s_mm)
  }
	
  if (s_mm.length == 1) {
    s_mm = "0" + s_mm
  }
	
  var s_dd = d.getDate();
  if (s_dd == 29 || s_dd == 30 || s_dd == 31) {
    s_dd = "28"
  } else {
    s_dd = String(s_dd)
  }
	
  if (s_dd.length == 1) {
    s_dd = "0" + s_dd
  }
	
  var start_date = yyyy + "-" + s_mm + "-" + s_dd;
  return start_date;
}

function getEndDate(){
  const d = new Date();
  var yyyy = String(d.getFullYear());
  var mm = String(d.getMonth() + 1);
	
  if (mm.length == 1) {
    mm = "0" + mm
  }
	
  var dd = String(d.getDate());
  if (dd.length == 1) {
    dd = "0" + dd
  }
	
  var end_date = yyyy + "-" + mm + "-" + dd;
  return end_date;
}
