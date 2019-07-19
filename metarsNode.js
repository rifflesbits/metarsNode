/*
  Simple web application to get FAA weather metars from provided airport ids
*/
const express = require('express');
const expressApp = express();
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const mustache = require('mustache');

// body parser is for getting post request params out of
// the http request sent to our server functions here
const bodyParser = require('body-parser');

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({extended: true}));

const hostname = '127.0.0.1';
const port = 3000;

/*
  Gets wx reports and writes them into the response

  airportIds 
    should be space or comma delimited
*/
function getWx(airportIds, httpResponse){

  var wxReqUrl = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=' + airportIds + '&hoursBeforeNow=1&mostRecentForEachStation=true&fields=raw_text';

  request(wxReqUrl, function (error, response, body) {
    // Print the error if one occurred
    console.log('error:', error);
    // Print the response status code if a response was received
    console.log('statusCode:', response && response.statusCode);

    var wxDoc = new DOMParser().parseFromString(body);

    // array of xml element objects themselves (not the direct string values)
    var aWxReportsRawTxtEls = wxDoc.getElementsByTagName('raw_text');

    // array to store the actual string values of the wx reports
    var aAllReports = [];

    // parse the xml dom elements; get the string values out of them
    for(var i=0; i < aWxReportsRawTxtEls.length; i++){

      // just the element object
      var firstWxReportEl = aWxReportsRawTxtEls[i];

      // the text node contained by the element object
      var firstWxReportTxtNode = firstWxReportEl.childNodes[0];

      // the actual string value of the txt node
      var sFirstWxReportTxtVal = firstWxReportTxtNode.nodeValue;

      aAllReports.push(sFirstWxReportTxtVal);
    }

    console.log('aAllReports: ' + aAllReports);

    // prepare object holding array of wx report results that we can send to the 
    // mustache template engine
    var viewContainer = {
      wxReports: aAllReports
    };

    // create a string with mustache template putting each wx report from array on a new line
    var wxReportsHtml = mustache.render('{{#wxReports}} <p> {{.}} </p> {{/wxReports}} ', viewContainer);

    console.log('output: \n' + wxReportsHtml);

    httpResponse.writeHead(200, {'Content-Type': 'text/html'});
    httpResponse.write(wxReportsHtml);
    httpResponse.end();
  });
}

// configure express with our ejs view resolver engine
expressApp.set('views', './views');
expressApp.set('view engine', 'ejs');

/*
  Show the initial load page that has the
  text box entry for airport ids and the
  submit button
*/
expressApp.get('/', (req, res) => {
  res.render('index');
});

/*
  Handles request to get wx wxReports
  Depends on input json containing req param: airportIds
*/
expressApp.post('/wx', function(req, res){

  var airportIds = req.body.airportIds;

  console.log('airportIds! = ' + airportIds);

  getWx(airportIds, res);
});

// entry point for starting the expressApp server
expressApp.listen(port, () => {
  console.log('Metars webapp running! on port: ' + port)
});
