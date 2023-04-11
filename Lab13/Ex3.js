const express = require("express");
const app = express();
const fs = require("fs");
const fname = "user_data.json";

// middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// check if the file exists before trying to read from it
if (fs.existsSync(fname)) {
	// read the file and parse the JSON data into an object
	const data = fs.readFileSync(fname, "utf-8");
	const users_reg_data = JSON.parse(data);
	console.log(users_reg_data);
} else {
	console.log("Sorry file " + fname + " does not exist.");
}

// display a login form for GET requests to /login
app.get("/login", function (request, response) {
	const loginForm = `
		<body>
			<form action="" method="POST">
				<input type="text" name="username" size="40" placeholder="enter username"><br />
				<input type="password" name="password" size="40" placeholder="enter password"><br />
				<input type="submit" value="Submit" id="submit">
			</form>
		</body>
	`;
	response.send(loginForm);
});

// process the login form for POST requests to /login
app.post("/login", function (request, response) {
	let POST = request.body;
	let user_name = POST["username"];
	let user_pass = POST["password"];

	console.log("User name=" + user_name + " password=" + user_pass);

	// check if the user exists and if the password matches
	if (users_reg_data[user_name] != undefined) {
		if (users_reg_data[user_name].password == user_pass) {
			response.send(user_name + " logged in");
		} else {
			response.redirect("/login?error='Bad password'");
		}
	} else {
		response.redirect("/login?error='No such user'");
	}
});

// start the server on port 8080
app.listen(8080, () => console.log(`listening on port 8080`));
