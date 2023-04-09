//Combination of Kazmans Lab 13 Explantion, Daniel Ports input, and a culmination of some WODs
//I start page by going to the server 
var express = require('express'); //code for server
var qs = require('querystring');
var app = express();
var products = require('./products.json');

//Krizel Tomines and Daniel Port
app.use(express.urlencoded({ extended: true })); //decode URL encoded data from POST requests

products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
//retreived from Nate Moylan
    //this function creates a for loop to generate the products for the page
    function display_products() {
        str = '';
        // loop to generate the products
        for (i = 0; i < products.length; i++) {
            str += `
            <section class ="item">
            <h2>${products[i].name}</h2> 
            <h3 label id ="quantity_available${i}"><i>Available: ${products[i].quantity_available} available!</i></h3></label>
            <h4>$${products[i].price.toFixed(2)}</h4>
            <img src="/images/${products[i].image}" class="img">
            <label id ="quantity${i}_label">Number of Items: </label>
            <input type="text" placeholder="0" name="quantity${i}" onkeyup="checkQuantityTextbox(this);"> 
            </section>`;

            // makes sure the quantity inputted by the user is validated. 
            if (typeof req.query['purchasebutton'] != 'undefined') {
        
                for (i = 0; i < products.length; i++) {
                    if (params.has(`quantity${i}`)) {
                        a_qty = params.get(`quantity${i}`);
                        // make textboxes sticky in case of invalid data
                        product_selection_form[`quantity${i}`].value = a_qty
                        total_qty += a_qty;
                        if (!isNonNegativeInteger(a_qty)) {
                            has_errors = true; // if invalid quantity
                 checkQuantityTextbox(product_selection_form[`quantity${i}`]); // shows where the error is
                        }
                    }
                }
                
                console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.query)); //log purchase quantities
            }
            next();
        }
        
        return str;
    }


 
// routing
// to monitor all process requests    
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});
app.post('/process_invoice', function (request, response, next) {
//to validate data
let POST = request.body;
    let name = products[0]['name'];
    let name_price = products[0]['price'];

    if (typeof POST['quantity_textbox'] != 'undefined') {
    let quantity = POST['quantity_textbox'];
    if (isNonNegativeInteger(quantity)) {
        products[0]['total_qty'] += Number(quantity);
        response.send(`<H2>Thank you for ordering ${quantity} ${name}! Your total is \$${quantity * name_price}.</H2>`);
    }else {
        response.send(`<I>${quantity} is not a valid quantity!</I>`);
    }
}

// to validate that an input value = a non negative integer
// inputstring is the input string; returnErrors indicates how the function returns
// true = return the array, false = return a boolean.    
function isNonNegInt(inputstring, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(inputstring) != inputstring) {
        errors.push('Not a number!'); // this is to check if string = a number value
    }
    else {
        if (inputstring > 10) errors.push('<font color="red">Only 10 items in stock!</font>'); // Checks if qty is within the available products
        if (inputstring == 0) errors.push('<font color="red">Enter a Number!</font>') // Checks if it is a Number
        if(inputstring < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
        if(parseInt(inputstring) != inputstring) errors.push('<font color="red">Not an integer!</font>'); // Check that it is an integer
        
        else if (q > products[i].quantity_available) errors.push('<font color="red">Over quantity available!</font>'); //Checks the available quantity

    }
    return returnErrors ? errors : (errors.length == 0);
}
//error bag
var errors={};



// route all other GET requests to files in public 

//if the data is valid, send them to the invoice, otherwise send them back to products_display
if(Object.keys(errors).length == 0) {
    response.redirect('./invoice.html?'+ qs.stringify(request.body)); //move to invoice page if no errors
}else{
    response.redirect('/products_display?'+ qs.stringify(request.body));
}
});


//start server
// handles request for any static files
app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));