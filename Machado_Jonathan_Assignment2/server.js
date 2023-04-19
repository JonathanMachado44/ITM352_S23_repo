//Jonahtan Machado Server.js (Based on momoka1926's server.js)
/*prod data*/
var products = require(__dirname + '/products.json'); // Require the 'products.json' file
var express = require('express'); // Require the 'express' module
var app = express(); // Create an instance of an Express app
var fs = require('fs'); // Require the 'fs' module for file operations
/* QueryString */
import('query-string').then(queryString => {
   // Use queryString module here
}).catch(error => {
   // Handle error
});
// User data
var filename = 'user_data.json'; // Define the filename for user data
var qty_data_obj = {}; // Create an empty object to store quantity data
/* Log out */
if (fs.existsSync(filename)) {
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data); // Read and parse the user data from the file
} else {
   console.log(`${filename} doesn't exist :(`);
}
// Body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
/* Login */
app.post("/process_login", function (request, response) {
   var errors = {}; // Create an object to store error messages
   var user_email = request.body['email'].toLowerCase(); // Get the lowercase email from the request body
   var the_password = request.body['password']; // Get the password from the request body
   // Check if username exists
   if (typeof users[user_email] != 'undefined') {
      // Check if entered password matches the stored password
      if (users[user_email].password == the_password) {
         // Matches
         qty_data_obj['email'] = user_email; // Store email in quantity data object
         qty_data_obj['fullname'] = users[user_email].name; // Store fullname in quantity data object
         // Redirect to invoice page with quantity data as query parameters
         let params = new URLSearchParams(qty_data_obj);
         response.redirect('./invoice.html?' + params.toString());
         return;
      } else {
         // Doesn't match
         errors['login_err'] = `Wrong Password`;
      }
   } else {
      // Email doesn't exist
      errors['login_err'] = `Wrong Email`;
   }
   // Redirect to login page with error message and email as query parameters
   let params = new URLSearchParams(errors);
   params.append('email', user_email); // Add email as a query parameter
   response.redirect(`./login.html?` + params.toString());
});
app.post("/register", function (request, response) {
   console.log(request.body); // Log the request body for debugging purposes
   var registration_errors = {}; // Object to store registration errors
   var reg_email = request.body['email'].toLowerCase(); // Get the lowercase version of email from request body
   
   // Check if email already exists
   if (typeof users[reg_email] != 'undefined') {
   registration_errors['email'] = 'This email has already been registered';
   }
   // Check if email is in valid format (x@y.z)
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,3}$/.test(request.body.email)) {
   // Email is valid
   } else {
   registration_errors['email'] = 'Please enter a valid email address';
   }
   // Check if email is not empty
   if (reg_email.length == 0) {
   registration_errors['email'] = 'Enter an email';
   }
   // Check if password is at least 8 characters long
   if (request.body.password.length < 8) {
   registration_errors['password'] = 'Minimum 8 characters';
   } else if (request.body.password.length == 0) { // Check if password is not empty
   registration_errors['password'] = 'Enter a password';
   }
   // Check if repeated password matches the original password
   if (request.body['password'] != request.body['repeat_password']) {
   registration_errors['repeat_password'] = 'The passwords do not match';
   }
   // Validate full name (only allow alphabets, commas, and spaces)
   if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {
   // Full name is valid
   } else {
   registration_errors['fullname'] = 'Please enter your full name';
   }
   // Check if full name is less than 30 characters
   if (request.body['fullname'].length > 30) {
   registration_errors['fullname'] = 'Please enter less than 30 characters';
   }
   // Save new registration data to user_data.json if no errors
   if (Object.keys(registration_errors).length == 0) {
   console.log('no registration errors') // Log if no registration errors for debugging purposes
   users[reg_email] = {};
   users[reg_email].password = request.body.password;
   users[reg_email].name = request.body.fullname;
   fs.writeFileSync(filename, JSON.stringify(users), "utf-8"); // Store user data in json file
   qty_data_obj['email'] = reg_email;
   qty_data_obj['fullname'] = users[reg_email].name;
   let params = new URLSearchParams(qty_data_obj);
   response.redirect('./invoice.html?' + params.toString()); // Redirect to invoice page with data
} else {
   request.body['registration_errors'] = JSON.stringify(registration_errors); // Add registration errors to request body
   let params = new URLSearchParams(request.body);
   response.redirect("./registration.html?" + params.toString()); // Redirect to registration page with errors
   }
   }); 
/* Data Change */
app.post("/newpw", function (request, response) { 
   var reseterrors = {};
   let login_email = request.body['email'].toLowerCase();
   let login_password = request.body['password'];
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(login_email) == false) {
      reseterrors['email'] = `Please enter a valid email`;
   } else if (login_email.length == 0) {
      reseterrors['email'] = 'Please enter an email';
   }
   //check password
   if (request.body['newpassword'] != request.body['repeatnewpassword']) {
      reseterrors['repeatnewpassword'] = `The new passwords do not match`;
   }
   if (typeof users[login_email] != 'undefined') {
      if (users[login_email].password == login_password) {
         //Require 8 char
         if (request.body.newpassword.length < 8) {
            reseterrors['newpassword'] = 'Password must have a minimum of 8 characters.';
         }//check if correct 
         if (users[login_email].password != login_password) {
            reseterrors['password'] = 'Incorrect password';
         }
         //Confirm correctly entered
         if (request.body.newpassword != request.body.repeatnewpassword) {
            reseterrors['repeatnewpassword'] = 'Both passwords must match';
         }//new password cant be same as old
         if (request.body.newpassword && request.body.repeatnewpassword == login_password) {
            reseterrors['newpassword'] = `New password cannot be the same as the old password`;
         }
      } else { //doesn't match
         reseterrors['password'] = `Incorrect Password`;
      }
   } else { //email doesn't exist
      reseterrors['email'] = `Email has not been registered`;
   }
   //If errors is empty | modified from register section which was taken from momoka michimoto,reece nagaoka
   // let params = new URLSearchParams(request.query);
   if (Object.keys(reseterrors).length == 0) {
      //Write data and send to invoice.html
      //users[login_email] = {}; commented out bc this overwrites the entire object
      users[login_email].password = request.body.newpassword
      //Writes user information into file
      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");
      //Add email to query
      qty_data_obj['email'] = login_email;
      qty_data_obj['fullname'] = users[login_email].name;
      let params = new URLSearchParams(qty_data_obj);
      response.redirect('./login.html?' + params.toString()); //all good! => to invoice w/data
      return;
   } else {
      //If there are errors, send back to page with errors
      request.body['reseterrors'] = JSON.stringify(reseterrors);
      let params = new URLSearchParams(request.body);
      response.redirect(`./update_info.html?` + params.toString());
   }
});
// Routing 
app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});
// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});
/*Purchase */
// process purchase request (validate quantities, check quantity available)
app.post('/process_form', function (request, response, next) {
   var quantities = request.body['quantity'];
   //assume no errors or no quantity
   var errors = {};
   var check_quantities = false;
   //check for NonNegInt
   for (i in quantities) {
      if (isNonNegInt(quantities[i]) == false) { //check i quantity
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[i].item}.`;
      }
      if (quantities[i] > 0) { //check if any quantity is selected
         check_quantities = true;
      }
      if (quantities[i] > products[i].quantity_available) { //check if quantity is available
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[i].item} available.`;
      }
   }
   if (!check_quantities) { //check if no quantity selected
      errors['no_quantities'] = `Please select a quantity`;
   }
   let qty_obj = { "quantity": JSON.stringify(quantities) };
   //ask if the object is empty or not
   if (Object.keys(errors).length == 0) {
      // remove quantities purchased from inventory quantities
      for (i in products) {
         products[i].quantity_available -= Number(quantities[i]);
      }
      //save quantity data for invoice *****change this to redirect to ./login.html
      qty_data_obj = qty_obj;
      response.redirect('./login.html');
   }
   else { //if i have errors, take the errors and go back to products_display.html
      let errs_obj = { "errors": JSON.stringify(errors) };
      console.log(qs.stringify(qty_obj));
      response.redirect('./shop.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
   }
});
//nonnegint function
function isNonNegInt(q, returnErrors = false) {
   errors = []; // assume no errors
   if (q == '') q = 0  //blank means 0
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
   if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

   return returnErrors ? errors : (errors.length == 0);
}
// routing 
app.use(express.static(__dirname + '/public'));
// start server
app.listen(8080, () => console.log(`listening on port 8080`));