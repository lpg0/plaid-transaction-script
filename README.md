# 🏦 plaid-transaction-script
## Introduction

There are a only few platforms that offer to automate bank transaction data into a Google Spreadsheet, however everything I could find required payment. Using the Plaid API and Google App Scripts this process is entirely free. 

The code for this project can be found on [GitHub](https://github.com/lpg0/plaid-transaction-script).

Please note that this project is barebones and it could be extended to synchronously update data and format it (see concluding section). 

## Setup

You will need a [Plaid account](https://dashboard.plaid.com/signup). After signing up, go to your [development dashboard](https://dashboard.plaid.com/overview)* and click **Build In Development**. You have 5 live bank account to use, which is plenty for a personal finance project. Here you will have access to the *client_id* API key and the *development_secret*. Keep this tab open since both will be used in the next section.

*Please note that this project may be first completed in sandbox mode to limit the chance of an accidental data leak, however I am only writing this for development.

## Access Token

The next step is to generate an access token. Via the Plaid founder's [recommendation](https://stackoverflow.com/a/49868230) (thanks Michael!) we will generate an access token by running the Plaid quickstart application locally where we can authenticate our bank. The quickstart project can be found [here](https://github.com/plaid/quickstart). The instructions are described in the README.md file, however due to some discrepancies I will walk through the process on Windows (Linux would be similar). 

First, clone the repo and cd into quickstart and then the python folder.

```
$ git clone https://github.com/plaid/quickstart
$ cd quickstart
```

In the python folder open the <u>.env</u> file and change the *PLAID_CLIENT_ID=client_id*, *PLAID_SECRET=development_secret*, and *PLAID_ENV=development*. Thee *PLAID_CLIENT_ID* and *PLAID_SECRET* were found from the setup section.

Then open the server.py file and replace the *"host=plaid.Environment.Sandbox"* line with *"host=plaid.Environment.Development"* on line 73. The sandbox mode is hardcoded into the server and this will overwrite it.

Next install the requirements and run the python server.

```
$ pip install -r requirements.txt
$ py start.sh
```

In a new terminal cd in quickstart and then into the frontend folder. Run npm install and then start the application.

```
$ cd quickstart
$ cd frontend
$ npm install
$ npm start
```

A browser window will open at http://localhost:3000/. From the running application you can authenticate your bank with your Plaid account via a pop up window. The following dashboard will provide an *item_id* and *access_token*. You can also test different http request from the application. Leave this tab open to reference the *access_token* in the next section.

## Transaction Scripting

In this section we will create a script that will import transaction data for one month into a Google Sheet. 

Go to **[Google Sheets](http://docs.google.com/spreadsheets/ "Google Sheets") > Blank** . Upon creating a new blank spreadsheet, add a title (such as "Transactions"). Then click **Tools > Script Editor**, which will open up a new window with the Script Editor.

Give the new script project a title (such as "Transactions Script"). 

In the function *myFunction()* we will need to use the *UrlFetchApp.fetch* function provided to use by the App Script APIs. The following function creates a simple POST request to recieve the JSON transaction data for the past month. Update the *start_date* and *end_date* accordingly (we will change this later).

```myFunction()
function myFunction() {
  var data = {
	  "client_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
	  "secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	  "access_token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	  "start_date": "2021-09-13",
	  "end_date": "2021-08-13"
  };
  var payload = JSON.stringify(data);
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
  };
  var url = "https://development.plaid.com/transactions/get";
  var response = UrlFetchApp.fetch(url, options);
  console.log(response.getContentText());
}
```

Run the script and fix any errors before proceeding. The transactions should now be displayed in the console.

The next step is to automate the *start_date* and *end_date*. The following two functions do this in a rather brute force way, but get the job done.

```getStartDate()
function getStartDate(){
  const d = new Date();
  var yyyy = String(d.getFullYear());
  var s_mm = d.getMonth();
  if (s_mm == 0) {
    s_mm = "12"
  }
  else {
    s_mm = String(s_mm)
  }
  if (s_mm.length == 1) {
    s_mm = "0" + s_mm
  }
  var s_dd = d.getDate();
  if (s_dd == 29 || s_dd == 30 || s_dd == 31) {
    s_dd = "28"
  }
  else {
    s_dd = String(s_dd)
  }
  if (s_dd.length == 1) {
    s_dd = "0" + s_dd
  }
  var start_date = yyyy + "-" + s_mm + "-" + s_dd;
  return start_date;
}
```

```getEndDate()
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
```

Update the function *myFunction()* as follows to automate the dates.

```myFunction()
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
  console.log(response.getContentText());
}
```

The final step is to export the JSON to the active spreadsheet. The JSON object that the <u>/transactions/get</u> HTTP response returns has the following basic structure. All of this information can be found in the [API docs](https://plaid.com/docs/api/products/#transactionsget).

```response.JSON
{
  "accounts": ,
  "item": ,
  "request_id": ,
  "total_transactions": ,
  "transactions": [
    {
      "account_id": ,
      "account_owner": ,
      "amount": ,
      "authorized_date": ,
      "authorized_datetime": ,
      "category": ,
      "category_id": ,
      "check_number": ,
      "date": ,
      "datetime": ,
      "iso_currency_code": ,
      "location": ,
      "merchant_name": ,
      "name": ,
      "payment_channel": ,
      "payment_meta": ,
      "pending": ,
      "pending_transaction_id": ,
      "personal_finance_category": ,
      "transaction_code": ,
      "transaction_id": ,
      "transaction_type": ,
      "unofficial_currency_code":
    },...
  ]
}
```

There is a lot here, but for this guide we will just use the date, amount, and name for each transaction.

The following function takes a JSON object and appends the transaction date, amount, and name to the active spreadsheet (make sure its open). 

```initializeSheet()
function initializeSheet(response) {
  var sheet = SpreadsheetApp.getActiveSheet();
  const obj = JSON.parse(response.getContentText());
  for (let i = 0; i < obj.transactions.length; i++) {
    sheet.appendRow([obj.transactions[i].date,obj.transactions[i].amount,obj.transactions[i].name]);
  }
}
```

Update the function *myFunction()* to account for the new feature.

```myFunction()
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
```

Run the script a check that the spreadsheet is populated properly.

## Conclusion

At this point the data pipeline from your bank to spreadsheet should be complete. 

There are many ways to extend this example. Quicker methods to receive the *access_token* should be possible since running a complete application seems a bit excessive. The App Script could be extended to retrieve different data objects or to do specific data validation and formatting.

Please leave a star if this was helpful.
