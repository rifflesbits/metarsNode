/*
  Simple application to get weather metars from airport ids
*/
const express = require('express');
const app = express();
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const mustache = require('mustache');

// body parser is for getting post request params out of
// the http request sent to our server functions here
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const hostname = '127.0.0.1';
const port = 3000;

/*
  Gets wx reports and writes them into the response
*/
function getWx(airportIds, httpResponse){

  var wxReqUrl = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=' + airportIds + '&hoursBeforeNow=1&mostRecentForEachStation=true&fields=raw_text';

  request(wxReqUrl, function (error, response, body) {
    // Print the error if one occurred
    console.log('error:', error);
    // Print the response status code if a response was received
    console.log('statusCode:', response && response.statusCode);

    var wxDoc = new DOMParser().parseFromString(body);

    var wxReports = wxDoc.getElementsByTagName('raw_text');


    var allReports = [];

    for(var i=0; i < wxReports.length; i++){

      var firstWxReportEl = wxReports[i];

      var firstWxReportTxtEl = firstWxReportEl.childNodes[0];

      var firstWxReportTxtVal = firstWxReportTxtEl.nodeValue;

      allReports.push(firstWxReportTxtVal);
    }

    console.log('allReports: ' + allReports);

    var view = {
      wxReports: allReports
    };

    var output = mustache.render('{{#wxReports}} <p> {{.}} </p> {{/wxReports}} ', view);

    console.log('output: \n' + output);

    httpResponse.writeHead(200, {'Content-Type': 'text/html'});
    httpResponse.write(output);
    httpResponse.end();
  });
}

app.set('views', './views');
app.set('view engine', 'ejs');

/*
  Show the initial load page that has the
  text box entry for airport ids and the
  submit button
*/
app.get('/', (req, res) => {
  res.render('index');
});

/*
  Handles request to get wx wxReports
  Depends on input json containing req param: airportIds
*/
app.post('/wx', function(req, res){

  var airportIds = req.body.airportIds;

  console.log('airportIds! = ' + airportIds);

  getWx(airportIds, res);
});

// entry point for starting the app server
app.listen(3000, () => {
  console.log('App Listening!...')
});
