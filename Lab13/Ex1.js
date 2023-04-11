// The 'require' function is used to import the built-in 'fs' module, which provides an API for interacting with the file system
var fs = require("fs");

// The name of the file we want to read from is assigned to the 'fname' variable
var fname = "user_data.json";

// The 'readFileSync' function is used to read the contents of the file synchronously, blocking the execution of the code until the entire file is read
// The 'utf-8' encoding is specified to ensure that the data is returned as a string
var data = fs.readFileSync(fname, "utf-8");

// The 'JSON.parse' function is used to parse the contents of the 'data' variable, which is a JSON string, into a JavaScript object
var users_reg_data = JSON.parse(data);

// The contents of the 'data' variable are printed to the console
console.log(data);

// The contents of the 'users_reg_data' object are printed to the console
console.log(users_reg_data);