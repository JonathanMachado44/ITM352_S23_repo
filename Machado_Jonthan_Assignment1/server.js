var express = require('express');
var app = express();

// Import and assign product information from products_data
var items_array = require("./products_data.json");

// Importing parser and querystring
var myParser = require("body-parser");
const queryString = require('querystring');

// Taken from lab 13
app.use(myParser.urlencoded({ extended: true })); 

// Validate whether or not inputs are valid
function isNonNegInt(q, returnErrors = false){
   errors = [];
   if (q == "") { q = 0; }
   if (Number(q) != q) { errors.push('Not a Number!'); } //String is not a number, error Not a Number
   if (q < 0) { errors.push('Negative value!'); } //String is negative value, error Negative Value
   if (parseInt(q) != q) { errors.push('Not an Integer!');} //String is not an integer, error Not an Integer
   return returnErrors ? errors : (errors.length == 0);
}

// Inputted quantities are less than stock
function validatestock_quantity(quantity_input, stock_quantity){
   if (quantity_input > stock_quantity){
      return false;
   }
}

// Routing 
app.use(myParser.urlencoded({extended : true}));
app.post("/purchase", function(request, response) {
   let POST = request.body; // assigning req body to var
   
   // Validate inputted quantities
   if (typeof POST['purchase_submit'] != 'undefined') { // validating quantities, and valid quantities
      var hasValidQuantities = true;
      var hasQuantities = false;
      var stock_quantity = true;

      // Check to see that valid quantities are in stock
      for (i = 0; i < items_array.length; i++){
      quantity = POST[`quantity${i}`];
      input_Quantities = quantity > 0;
      valid_Quantities = hasValidQuantities && isNonNegInt(quantity);
      stock_quantity = validatestock_quantity(quantity, items_array[i]['quantity_available']) && isNonNegInt(quantity);
      }

      // Make into queryString
      const stringified = queryString.stringify(POST); 

      if (hasQuantities && hasValidQuantities && stock_quantity) {
            response.redirect("./invoice.html?" + stringified); // Send to invoice page
      } else {
       response.redirect("./products_display.html?" + stringified); // Send back to store
      }
   }
   console.log(request.body);
})









// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server