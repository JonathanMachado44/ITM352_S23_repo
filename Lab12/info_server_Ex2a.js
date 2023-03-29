var express = require('express');
var app = express();

app.use(express.urlencoded({ extended: true }));

//respond to any req for any path
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});
app.get('/test', function (request, response, next) {
    response.send(request.method + ' to paths ' + request.path);
});

app.use(express.static(__dirname + '/public'));

app.listen(8080, () => console.log(`listening on port 8080`));