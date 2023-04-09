// Assignment 1 Server
//Praise Zenan

//VARIABLE DEFINITIONS USING EXPRESS
var express = require("express");
var app = express();

// Import and assign product information from products.json
var products = require(__dirname + "/products.json");

//All product elements from array are 0
products.forEach((products) => {
  products.sold = 0;
});

// Importing parser and querystring
var myParser = require("body-parser");

// route all other GET requests to files in public folder
app.use(express.static(__dirname + "/Public"));

// Validate whether or not inputs are valid
function isNonNegInt(n) {
  errors = []; // assume no errors at first
  if (Number(n) != n) errors.push("Not a number!"); // Check if string is a number value
  if (n < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(n) != n) errors.push("Not an integer!"); // Check that it is an integer
  if (errors.length == 0) {
    return true;
  } else {
    let message = errors.join("");
    return message;
  }
}

// Inputted quantities are less than stock

//products_data is sent as a string
app.get("/products.json", function (request, response) {
  response.type(".json");
  var products_str = `var products = ${JSON.stringify(products)};`;
  response.send(products_str);
});

// Inputted quantities are less than stock

// Routing
app.use(myParser.urlencoded({ extended: true }));
app.post("/purchase", function (request, response) {
  let input = request.body['quantity']; // assigning req body to var

  // Validate inputted quantities

  // variables that make my Errors ForLoop
  let valid = true;
  let invalidblank = false;
  let validstock = true;
  let hell = false;
  let ordered = "";

  // monitors all requests
  app.all("*", function (request, response, next) {
    console.log(request.method + " to " + request.path);
    next();
  });

  for (let i in input) { // Iterate over all text boxes in the form.
    quantity = input[i];
    let item = products[i]['name'];
    if (quantity == 0) { // assigning no value to certain items to avoid errors in invoice.html
      ordered += item + "=" + quantity + "&";
    } else if (isNonNegInt(quantity) && Number(quantity) <= products[i].stock) { // if quantity is true, added to ordered string
      // We have a valid quantity. Add to the ordered string.
      products[i].stock -= Number(quantity);
      products[i].sold =
        Number(products[i].sold) + Number(quantity);
      ordered += item + "=" + quantity + "&"; // appears in invoice.html's URL
    } else if (isNonNegInt(quantity) != true) { // quantity is "Not a Number, Negative Value, or not an Integer"
      valid = false;
    } else if (Number(quantity) >= products[i].stock) { // Existing stock is less than desired quantity
      validstock = false;
    } else { // textbox has gone missing? or some other error
      othererrors = true;
    }
  }

  if (input.join("") == 0) { // if the array customerquantities adds up to 0, that means there are no quantities typed in
    invalidblank = true;
  }

  // If error found, redirect back to the order page, if not, proceed to invoice

  if (invalidblank) { // if all boxes are blank, there is an error, pops up alert
    response.redirect('storepage.html?error=Invalid%20Quantity,%20No%20Quantities%20Selected!%20Please%20type%20in%20values!');
  } else if (!valid) { // quantity is "Not a Number, Negative Value, or not an Integer", pops up alert
    response.redirect('storepage.html?error=Invalid%20Quantity,%20Please%20Fix%20the%20Errors%20in%20Red%20on%20the%20Order%20Page!');
  } else if (!validstock) { // Existing stock is less than desired quantity, pops up alert
    response.redirect('storepage.html?error=Invalid%20Quantity,%20Requested%20Quantity%20Exceeds%20Stock');
  } else if (hell) { // textbox has gone missing? or some other error, pops up alert
    response.redirect('storepage.html?error=Invalid%20Quantity,%20Unknown%20Error%20has%20occured');
  } else {
    // If everything is good, redirect to the invoice page.
    response.redirect('invoice.html?' + ordered);
  };
});

// start server
app.listen(8080, () => console.log(`listening on port 8080`));