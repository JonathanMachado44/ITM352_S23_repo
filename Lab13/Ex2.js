// The 'require' function is used to import the built-in 'fs' module, which provides an API for interacting with the file system
var fs = require("fs");

// The name of the file we want to read from is assigned to the 'fname' variable
var fname = "user_data.json";

// The 'existsSync' function is used to check if the file exists
if (fs.existsSync(fname)) {

	// The 'readFileSync' function is used to read the contents of the file synchronously, blocking the execution of the code until the entire file is read
	// The 'utf-8' encoding is specified to ensure that the data is returned as a string
	var data = fs.readFileSync(fname, "utf-8");

	// The 'statSync' function is used to get information about the file, such as its size
	var status = fs.statSync(fname);

	// The size of the file is printed to the console
	console.log("The file is " + status.size + " bytes");

	// The contents of the 'data' variable, which is a JSON string, are parsed into a JavaScript object using the 'JSON.parse' function
	var users_reg_data = JSON.parse(data);

	// The contents of the 'users_reg_data' object are printed to the console
	console.log(users_reg_data);
} else {
	// If the file does not exist, an error message is printed to the console
	console.log("Sorry file " + fname + " does not exist.");
}
