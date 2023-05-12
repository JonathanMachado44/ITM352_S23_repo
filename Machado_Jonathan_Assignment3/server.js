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


app.post("/update_cart", function (request, response) {
   // loop through each product in the cart
   for (let pkey in request.session.cart) { 
      // loop through each item in the product
      for (let i in request.session.cart[pkey]) { 
         // check if quantity data for this item was submitted in the request
         if (typeof request.body[`qty${pkey}${i}`] != 'undefined') { 
            // if so, update the quantity in the cart
            request.session.cart[pkey][i] = Number(request.body[`qty${pkey}${i}`]); 
         }
      }
   } 

   for (let pkey in request.session.favorite) { 
      // loop through each item in the favorites for the current product
      for (let i in request.session.favorite[pkey]) { 
         // check if a quantity was submitted for this item in the request
         if (typeof request.body[`qty_${pkey}_${i}`] != 'undefined') { 
            // if a quantity was submitted, add the item to the cart
            // if this is the first item of this product in the cart, create a new array to hold the items
            if (typeof request.session.cart[pkey] == 'undefined') {
               request.session.cart[pkey] = [];
            }
            // copy the favorite item to the cart item
            request.session[pkey] = request.session.favorite[pkey]; 
            // set the quantity for the current item in the cart
            request.session.cart[pkey][i] = Number(request.body[`qty_${pkey}_${i}`]); 
            // log the quantity to the console
            console.log(request.session.cart[pkey][i]);
         }
      }
   }
   // redirect the user to the cart page
   response.redirect("./cart.html");
   

});


// Define an endpoint for the "/checkout" URL using the GET method
app.get("/checkout", function (request, response) {
   // Initialize an object to store potential errors
   var errors = {};
   
   // If the user's email is not present in the request cookies, redirect them to the login page
   if (typeof request.cookie["email"] == 'undefined') { 
      response.redirect(`./login.html`);
      return;
   }
   
   // If there are no errors, proceed to checkout by building an invoice URL with the user's full name
   if (JSON.stringify(errors) === '{}') { 
      // Retrieve the user's email from the request cookies
      let login_email = request.cookie['email'];
      
      // Build a URL containing the user's full name as a parameter
      let params = new URLSearchParams();
      params.append('fullname', users[login_email]['fullname']); 
      response.redirect(`./invoice.html?` + params.toString()); 
      
      // Log the user's cookie for debugging purposes
      console.log(user_cookie);
   } else {
      // If there are errors, redirect the user back to the cart page
      response.redirect(`./cart.html`);
   }
});
// Define an endpoint for the "/get_products_data" URL using the POST method
app.post("/get_products_data", function (request, response) {
   // Return the product data as a JSON response
   response.json(products);
});
// Define an endpoint for the "/get_cart" URL using the POST method
app.post("/get_cart", function (request, response) {
   // Return the user's cart data from the session as a JSON response
   response.json(request.session.cart);
});


// Define an endpoint for the "/complete_purchase" URL using the POST method
app.post("/complete_purchase", function (request, response) {
   // Initialize subtotal and invoice string
   subtotal = 0;
   var invoice_str = `Thank you for your order!
   <table border><th style="width:10%">Item</th>
   <th class="text-right" style="width:15%">Quantity</th>
   <th class="text-right" style="width:15%">Price</th>
   <th class="text-right" style="width:15%">Extended Price</th>`;
   
   // Retrieve the user's shopping cart from the session
   var shopping_cart = request.session.cart;
   
   // Loop through each product in the shopping cart
   for (product_key in shopping_cart) {
      for (i = 0; i < shopping_cart[product_key].length; i++) {
         // If the product is undefined, skip to the next iteration of the loop
         if (typeof shopping_cart[product_key] == 'undefined') continue;
         
         // Retrieve the quantity of the product
         qty = shopping_cart[product_key][i];
         
         // Calculate the extended price of the product based on its quantity and price
         let extended_price = qty * products[product_key][i].price;
         
         // Add the extended price to the subtotal
         subtotal += extended_price;
         
         // If the quantity of the product is greater than zero, add a row to the invoice string with the product details
         if (qty > 0) {
            invoice_str += `<tr><td>${products[product_key][i].item}</td>
            <td>${qty}</td>
            <td>${products[product_key][i].price}</td>
            <td>${extended_price}
            <tr>`;
         }
      }
   }
// Set the tax rate for the purchase
var tax_rate = 0.05;

// Calculate the tax based on the subtotal
var tax = tax_rate * subtotal;

// Calculate the delivery charge based on the subtotal
if (subtotal <= 49.99) {
   delivery = 3;
}
else if (subtotal <= 99.99) {
   delivery = 6;
}
else {
   delivery = 0.07 * subtotal;
}

// Calculate the grand total of the purchase by adding the subtotal, tax, and delivery charge
var grand_total = subtotal + tax + delivery;

// Add a table row to the invoice string with the subtotal, delivery charge, tax, and grand total
invoice_str += `<tr>
                  <tr><td colspan="4" align="right">Subtotal: $${subtotal.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Delivery: $${delivery.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Tax: $${tax.toFixed(2)}</td></tr>
                  <tr><td colspan="4" align="right">Grand Total: $${grand_total.toFixed(2)}</td></tr>
               </table>`;

// Create a nodemailer transport object with the SMTP server settings
var transporter = nodemailer.createTransport({
   host: "mail.hawaii.edu",
   port: 25,
   secure: false, 
   tls: {
      rejectUnauthorized: false
   }
});

// Get the email address of the user from the session object
var user_email = request.session.email;

// Create an object with the email message options, including the sender, recipient, subject, and HTML content of the email
var mailOptions = {
   from: 'jam30@hawaii.edu',
   to: user_email,
   subject: 'Jons Cat store Invoice',
   html: invoice_str
};
// This code sends an email containing an invoice to a user and handles user logout.
transporter.sendMail(mailOptions, function (error, info) {
   if (error) {
      // If there was an error sending the email, add a message to the invoice string indicating the error.
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
   } else {
      // If the email was sent successfully, add a message to the invoice string indicating who it was sent to.
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
   }
   // Clear the user cookie from the response.
   response.clearCookie("user_cookie");
   // Send a JavaScript alert to the user indicating that the invoice was sent, and redirect to the index page.
   response.send(`<script>alert('Invoice has been sent'); location.href="/index.html"</script>`);
   // Destroy the session for this user.
   request.session.destroy();
});
});
// When the user navigates to the "/logout" URL, clear their user cookie and destroy their session.
app.get("/logout", function (request, response, next) {
response.clearCookie("user_cookie");
request.session.destroy();
// Send a JavaScript alert to the user indicating that they have been logged out, and redirect to the index page.
response.send(`<script>alert('Logged Out'); location.href="/index.html"</script>`);
});
// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

// Start the server on port 8080 and log a message to the console when the server is running
app.listen(8080, () => console.log(`listening on port 8080`));

// Define a function that checks if a given value is a non-negative integer
function isNonNegInt(q, returnErrors = false) {
   // Create an empty array to hold any errors
   errors = [];

   // If the input is blank, assume it is 0
   if (q == '') q = 0;

   // Check if the input is a number; if not, add an error message to the array
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>');

   // Check if the input is negative; if so, add an error message to the array
   if (q < 0) errors.push('<font color="red">Negative value</font>');

   // Check if the input is an integer; if not, add an error message to the array
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>');

   // If the returnErrors argument is true, return the array of errors; otherwise, return true if there are no errors, and false otherwise
   return returnErrors ? errors : (errors.length == 0);
}
