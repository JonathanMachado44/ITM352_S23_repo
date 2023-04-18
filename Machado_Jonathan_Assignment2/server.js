//Based on blakesaari's server.js
// First, require the necessary modules
var express = require('express');
var app = express();
const qs = require('querystring');
// require the products data and set initial inventory
var products = require('./produsts.json');
products.forEach((prod, i) => {
prod.quantity_available = 20;
});
// add middleware to get the request body
app.use(express.urlencoded({ extended: true }));
// log all requests to the console
app.all('*', function (request, response, next) {
console.log(request.method + ' to ' + request.path, request.body);
next();
});
// send the products data as a JavaScript file
app.get("/products.js", function (request, response, next) {
response.type('.js');
var products_str = `var products = ${JSON.stringify(products)};`;
response.send(products_str);
});
//quantity validation
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (q == '') q = 0  //blank means 0
    if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
    if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer
    return returnErrors ? errors : (errors.length == 0);
}
// process the order form
app.post('/process_form', function (request, response, next) {
    var quantities = request.body["quantity"];
    var errors = {};
    var has_quantities = false;
// Check that quantities are non-negative integers
    for (i in quantities) {
        // check quantity
        if (isNonNegInt(quantities[i]) == false) {
            errors['quantity_' + i] = `Needs valid # ${products[i].name}`;
        }
        // Check if any quanties were selected
        if (quantities[i] > 0) {
            has_quantities = true;
        }
        // Check if quantity desired is avaialble
        if (quantities[i] > products[i].quantity_available) {
            errors['quantity_available' + i] = `Don't have ${(quantities[i])} ${products[i].name}`;
        }
    }
    // Check if quantity is selected
    if (!has_quantities) {
        errors['no_quantities'] = `Enter a value`;
    }
    if (Object.keys(errors).length == 0) {
        // remove from inventory quantities
        for(i in products){
            products[i].quantity_available -= Number(quantities[i]);
        }
        let qty_obj = { "quantity": JSON.stringify(quantities) };
        response.redirect('./invoice.html?' + qs.stringify(qty_obj));
    } else {
        let errs_obj = { "errors": JSON.stringify(errors) };
        let qty_obj = { "quantity": JSON.stringify(quantities) };
        response.redirect('./products_display.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
    }
});
// serve static files from the public directory
app.use(express.static('./public'));
// start server
app.listen(8080, () => console.log('listening on port 8080'));