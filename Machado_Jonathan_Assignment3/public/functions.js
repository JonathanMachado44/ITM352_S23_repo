// Jonathan Machado Function.js (This function is used to load a JSON file using an XMLHttpRequest) based on blakesaari's functions.js

function loadJSON(service, callback) {   
    // Create a new XMLHttpRequest object
    var xobj = new XMLHttpRequest();
    // Set the MIME type to "application/json"
    xobj.overrideMimeType("application/json");
    // Open a POST request to the specified service URL, using synchronous request (false)
    xobj.open('POST', service, false);
    // Set the function to be executed when the state of the XMLHttpRequest changes
    xobj.onreadystatechange = function () {
          // If the state is "done" and the status is "OK"
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Call the provided callback function with the response text as parameter
            callback(xobj.responseText);
          }
    };
    // Send the request (with no data)
    xobj.send(null);  
 }
// This function is used to create a navigation bar with links to other products
function nav_bar(this_product_key, products_data) {
    // Loop through each product in the products_data object
    for (let products_key in products_data) {
        // Skip the current product
        if (products_key == this_product_key) continue;
        // Write a list item with a link to the other product's shop page
        document.write(`<li><a href="./shop.html?products_key=${products_key}">${products_key}</a></li>`);
    }
}

    
    
    
    
    
    
    
