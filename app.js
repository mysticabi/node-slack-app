var http = require('http');
var request = require('request');
const express = require('express')
const app = express()
const port = 3000
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
app.get('/jenkins', (req, res) => {

    var str = "this";
    var url = "http://34.94.219.43:8080/job/slack-notification/api/json";
    var auth = "Basic " + new Buffer("admin:admin").toString("base64");;
    request(
        {
            url : url,
            headers : {
                "Authorization" : auth
            }
        },
        function (error, response, body) {
            console.log("inside function line 34");
            console.log(response.statusCode);
            console.log(response.body);
          str += " --> " + response.body;
          res.send(str);
        }
    );
res.end;
  })