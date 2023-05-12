//Jonathan Machado Server.js (Based on momoka1926's server.js)
// Load product data from a JSON file
var products = require(__dirname + '/products.json');

// Set up the Express web framework
var express = require('express');
var app = express();

// Load the Node.js filesystem module
var fs = require('fs')

// Set up a session middleware to track user sessions
var session = require('express-session');
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

// Set up middleware to handle cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Load the nodemailer module for sending email
var nodemailer = require('nodemailer');

// Set the filename for the user data file
var filename = 'user_data.json';

// Check if the user data file exists, and load it if so
if (fs.existsSync(filename)) {
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data);
} else {
   console.log(`${filename} doesn't exist :(`);
}

// Set up middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

/* Handle the login form submission */
app.post("/process_login", function (request, response) {
   var errors = {};

   // Get the email and password from the login form POST request
   var user_email = request.body['email'].toLowerCase();
   var the_password = request.body['password']

   // Check if the email exists in the user data, and if so, check the password
   if (typeof users[user_email] != 'undefined') {
      // Check if the entered password matches the stored password
      if (users[user_email].password == the_password) {
         // Set a cookie to remember the user's name for 15 minutes
         response.cookie('user_cookie', users[user_email]['name'], { maxAge: 900 * 1000 }); // expires in 15 mins
         // Save the user's email in the session for later use
         request.session.email = request.body['email'].toLowerCase(); //email for sending invoice
         console.log(request.session.email)
         // Redirect the user back to the products page
         response.redirect('./shop.html');
         return;
      } else {
         // Password doesn't match
         errors['login_err'] = `Wrong Password`;
      }
   } else {
      // Email doesn't exist in user data
      errors['login_err'] = `Wrong Email`;
   }

   // If there were errors, redirect back to the login page with error message and email value
   let params = new URLSearchParams(errors);
   params.append('email', user_email); //put email into params
   response.redirect(`./login.html?` + params.toString());
});

// Register endpoint for handling POST requests from registration form
app.post("/register", function (request, response) {
   var registration_errors = {};

   // Check email
   var reg_email = request.body['email'].toLowerCase();

   // Check if email matches pattern
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email)) {

   } else {
      registration_errors['email'] = 'Please enter a valid email address';
   }

   // Check if email box is empty
   if (reg_email.length == 0) {
      registration_errors['email'] = `Enter an email`;
   }

   // Check if email is unique
   if (typeof users[reg_email] != 'undefined') {
      registration_errors['email'] = `This email has already been registered`;
   }

   // Check password length
   if (request.body.password.length < 8) {
      registration_errors['password'] = `Minimum 8 characters`;
   } else if (request.body.password.length == 0) { // Nothing entered
      registration_errors['password'] = `Enter a password`;
   }

   // Check if repeated password matches
   if (request.body['password'] != request.body['repeat_password']) {
      registration_errors['repeat_password'] = `The passwords do not match`;
   }

   // Full name validation
   if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {
      // Check if the fullname is correct   
   } else {
      registration_errors['fullname'] = `Please enter your full name`;
   }

   // Check if fullname is less than 30 characters
   if (request.body['fullname'].length > 30) {
      registration_errors['fullname'] = `Please enter less than 30 characters`;
   }

   // Save new registration data to user_data.json
   if (Object.keys(registration_errors).length == 0) {
      console.log('no registration errors') // Store user data in json file
      users[reg_email] = {};
      users[reg_email].password = request.body.password;
      users[reg_email].name = request.body.fullname;

      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      response.redirect('./login.html'); // All good! => To invoice with data
   } else {
      request.body['registration_errors'] = JSON.stringify(registration_errors);
      let params = new URLSearchParams(request.body);
      response.redirect("./registration.html?" + params.toString()); // Redirect to registration page with error messages
   }
});


// Handles POST request to update password
app.post("/newpw", function (request, response) { 
   var reseterrors = {}; // Initialize an empty object to store potential errors

   // Retrieve user's email and new password from the form
   let login_email = request.body['email'].toLowerCase();
   let login_password = request.body['password'];

   // Check if the entered email is valid
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(login_email) == false) {
      reseterrors['email'] = `Please enter a valid email`;
   } else if (login_email.length == 0) { // Check if the entered email is empty
      reseterrors['email'] = 'Please enter an email';
   }
   
   // Check if the entered new passwords match
   if (request.body['newpassword'] != request.body['repeatnewpassword']) {
      reseterrors['repeatnewpassword'] = `The new passwords do not match`;
   }

   // Check if the email exists in the user database
   if (typeof users[login_email] != 'undefined') {
      if (users[login_email].password == login_password) { // Check if the entered password is correct
         // Check if the new password has a minimum of 8 characters
         if (request.body.newpassword.length < 8) {
            reseterrors['newpassword'] = 'Password must have a minimum of 8 characters.';
         }
         // Check if the entered passwords match
         if (request.body.newpassword != request.body.repeatnewpassword) {
            reseterrors['repeatnewpassword'] = 'Both passwords must match';
         }
         // Check if the new password is the same as the old password
         if (request.body.newpassword && request.body.repeatnewpassword == login_password) {
            reseterrors['newpassword'] = `New password cannot be the same as the old password`;
         }
      } else { // If the entered password is incorrect
         reseterrors['password'] = `Incorrect Password`;
      }
   } else { // If the entered email doesn't exist in the user database
      reseterrors['email'] = `Email has not been registered`;
   }

   // If there are no errors
   if (Object.keys(reseterrors).length == 0) {
      // Update the user's password in the user database
      users[login_email].password = request.body.newpassword;

      // Write the updated user information into file
      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      // Redirect to login page after successful update
      response.redirect('./login.html');
      return;
   } else { // If there are errors
      // Send back to the page with errors
      request.body['reseterrors'] = JSON.stringify(reseterrors);
      let params = new URLSearchParams(request.body);
      response.redirect(`./update_info.html?` + params.toString());
   }
});

// Routing for products.js
app.get("/products.js", function (request, response, next) {
   // Set the response type to .js
   response.type('.js');
   // Convert products data to a string and send it as a response
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// Monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);

   // Create session cart at any request
   // anytime it's used
   if (typeof request.session.cart == 'undefined') {
      request.session.cart = {};
   }

   // Create session email at any request
   // anytime it's used
   if (typeof request.session.email == 'undefined') {
      request.session.email = {};
   }
   
   next();
});
// Handle POST requests to add items to cart
app.post('/add_to_cart', function (request, response, next) {

   // Initialize variables
   var products_key = request.body['products_key'];
   var errors = {}; // Create an empty errors object to store any validation errors
   var check_quantities = false; // Initialize a flag to check if any quantities have been selected
   
   // Validate the quantities for each product in the cart
   for (i in products[products_key]) {
      var quantities = request.body['quantity'];
      
      // Check if the quantity entered is a non-negative integer
      if (isNonNegInt(quantities[i]) == false) {
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[products_key][i].item}.`;
      }
      
      // Check if any quantity is selected for the product
      if (quantities[i] > 0) {
         check_quantities = true;
      }
      
      // Check if the quantity requested is available for the product
      if (quantities[i] > products[products_key][i].quantity_available) {
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[products_key][i].item} available.`;
      }
   }
   
   // Check if any quantity has been selected
   if (!check_quantities) {
      errors['no_quantities'] = `Please select a quantity`;
   }
   
   // Prepare parameters for redirecting to the shop page with error messages
   let params = new URLSearchParams();
   params.append('products_key', products_key); // Add the product key to the parameters for the cart page
   
   // Check if there are any validation errors
   if (Object.keys(errors).length > 0) {
      
      // If there are errors, redirect to the shop page with the error messages
      params.append('errors', JSON.stringify(errors)); // Add the error messages to the parameters
      response.redirect('./shop.html?' + params.toString());
      return;
   }
   else {
      
      // If there are no errors, add the selected quantities to the cart
      if (typeof request.session.cart[products_key] == 'undefined') {
         // Create an empty array for the product category if it doesn't already exist in the cart
         request.session.cart[products_key] = [];
      }
      
      // Convert the quantity strings from the form post to numbers
      var quantities = request.body['quantity'].map(Number);
      
      // Store the quantities array in the session cart object with the same products_key
      request.session.cart[products_key] = quantities;
      
      // Redirect to the cart page
      response.redirect('./cart.html');
      
      // Log the updated cart to the console
      console.log(request.session.cart);
   }
});

// Handle post request to update the shopping cart with new quantities
app.post("/update_cart", function (request, response) {

   // Loop through each product in the shopping cart
   for (let pkey in request.session.cart) {
      
      // Loop through each selected quantity of the product
      for (let i in request.session.cart[pkey]) {

         // Check if user input for quantity exists
         if (typeof request.body[`qty${pkey}${i}`] != 'undefined') {

            // Update shopping cart data with new quantity
            request.session.cart[pkey][i] = Number(request.body[`qty${pkey}${i}`]);
         }
      }
   }  

   // Redirect user to the shopping cart page
   response.redirect("./cart.html");
});
// Handle GET requests to '/checkout' endpoint
app.get("/checkout", function (request, response) {
   var errors = {}; // Initialize empty errors object
   // Check if user is logged in by checking for the existence of a 'email' cookie
   if (typeof request.cookie["email"] == 'undefined') {
      response.redirect(`./login.html`); // If not logged in, redirect to the login page
      return;
   }
   // If there are no errors, proceed to the invoice page
   if (JSON.stringify(errors) === '{}') {
      let login_email = request.cookie['email'];
      // Add user's full name to the URL parameters for personalization
      let params = new URLSearchParams();
      params.append('fullname', users[login_email]['fullname']);
      response.redirect(`./invoice.html?` + params.toString());
      console.log(user_cookie);
   } else {
      response.redirect(`./cart.html`); // If there are errors, redirect to the shopping cart page
   }
});
app.post("/get_products_data", function (request, response) {
   // Handler for getting product data
   response.json(products);
});

app.post("/get_cart", function (request, response) {
   // Handler for getting the shopping cart data
   response.json(request.session.cart);
});

app.post("/complete_purchase", function (request, response) {
   // Handler for completing a purchase and generating an invoice
   // Generate HTML invoice string
   subtotal = 0;
   var invoice_str = `Thank you for your order!
<table border><th style="width:10%">Item</th>
<th class="text-right" style="width:15%">Quantity</th>
<th class="text-right" style="width:15%">Price</th>
<th class="text-right" style="width:15%">Extended Price</th>`;
   var shopping_cart = request.session.cart;
   for (product_key in shopping_cart) {
      for (i = 0; i < shopping_cart[product_key].length; i++) {
         if (typeof shopping_cart[product_key] == 'undefined') continue;
         qty = shopping_cart[product_key][i];
         let extended_price = qty * products[product_key][i].price;
         subtotal += extended_price;
         if (qty > 0) {
            invoice_str += `<tr><td>${products[product_key][i].item}</td>
            <td>${qty}</td>
            <td>${products[product_key][i].price}</td>
            <td>${extended_price}
            <tr>`;
         }
      }
   }
  // Compute tax based on a tax rate of 5%
var tax_rate = 0.05;
var tax = tax_rate * subtotal;

// Compute delivery fee based on subtotal
if (subtotal <= 49.99) {
   delivery = 3;
}
else if (subtotal <= 99.99) {
   delivery = 6;
}
else {
   delivery = 0.07 * subtotal; 
}

// Compute grand total by adding subtotal, tax, and delivery fee
var grand_total = subtotal + tax + delivery;

// Add the subtotal, delivery fee, tax, and grand total to the invoice string
invoice_str += `<tr>
                  <tr><td colspan="4" align="right">Subtotal: $${subtotal.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Delivery: $${delivery.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Tax: $${tax.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Grand Total: $${grand_total.toFixed(2)}</td></tr>
               </table>`;

// Set up mail server. Only works on UH Network due to security restrictions
var transporter = nodemailer.createTransport({
   host: "mail.hawaii.edu",
   port: 25,
   secure: false, // use TLS
   tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
   }
});

// Get user email from session
var user_email = request.session.email;

// Set up mail options
var mailOptions = {
   from: 'jam30@hawaii.edu',
   to: user_email,
   subject: 'Jons Cat store Invoice',
   html: invoice_str
};

// Send email with invoice
transporter.sendMail(mailOptions, function (error, info) {
   if (error) {
      // Add error message to invoice string if email fails
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
   } else {
      // Add success message to invoice string if email is sent
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
   }
   // Clear user cookie and redirect to index page
   response.clearCookie("user_cookie");
   response.send(`<script>alert('Invoice has been sent'); location.href="/index.html"</script>`);
   request.session.destroy(); //clear cart
});

// This section of the code logs out a user by clearing their cookie and destroying their session, then redirects them to the index.html page.
app.get("/logout", function (request, response, next) {
   response.clearCookie("user_cookie");
   request.session.destroy();
   // Redirects user to index.html and displays an alert message.
   response.send(`<script>alert('Logged Out'); location.href="/index.html"</script>`);
});
});
// This section of the code routes all other GET requests to files in the public directory.
app.use(express.static(__dirname + '/public'));

// This function checks whether a given value is a non-negative integer.
function isNonNegInt(q, returnErrors = false) {
   errors = []; // Assume there are no errors.
   if (q == '') q = 0;  // Treat blank value as 0.
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); // Check if value is a number.
   if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if value is non-negative.
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if value is an integer.

   return returnErrors ? errors : (errors.length == 0);
}
