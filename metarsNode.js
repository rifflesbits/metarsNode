/*
  Simple application to get weather metars from airport ids
*/

const http = require('http');
const fs = require('fs');
const request = require('request');
//const xmldoc = require('xmldoc');
const DOMParser = require('xmldom').DOMParser;

const hostname = '127.0.0.1';
const port = 3000;

var airportIds;

function getWx(httpResponse){

  var wxReqUrl = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=KJZI,KLRO&hoursBeforeNow=1&mostRecentForEachStation=true&fields=raw_text';

  request(wxReqUrl, function (error, response, body) {
    // Print the error if one occurred
    console.log('error:', error);
    // Print the response status code if a response was received
    console.log('statusCode:', response && response.statusCode);

    var wxDoc = new DOMParser().parseFromString(body);

    var wxReports = wxDoc.getElementsByTagName('raw_text');

    httpResponse.writeHead(200, {'Content-Type': 'text/html'});

    for(var i=0; i < wxReports.length; i++){

      var firstWxReportEl = wxReports[i];

      var firstWxReportTxtEl = firstWxReportEl.childNodes[0];

      var firstWxReportTxtVal = firstWxReportTxtEl.nodeValue;

      console.log(firstWxReportTxtVal);

      httpResponse.write('<p>' + firstWxReportTxtVal + '</p>');
    }

    httpResponse.end();
  });
}

//res.write('<h2>Date/Time: ' + dt.myDateTime() + '</h2>');

const server = http.createServer((req, res) => {

    getWx(res); //asynch

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
