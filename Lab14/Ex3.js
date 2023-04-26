// Load Express
var express = require('express');
var app = express();

// Cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Load User Data
var filename = "./user_data.json";

// Require filesync
const fs = require("fs");

if(fs.existsSync(filename)) {
    let stats = fs.statSync(filename);
    console.log(`${filename} has ${stats.size} characters`);
    var data = fs.readFileSync(filename, 'utf-8');
    var users = JSON.parse(data);
    if(typeof users["Port"] != 'undefined') {
        console.log(users["Port"].password);
    }
} else {
    console.log(`${filename} does not exist!`);
}
app.use(express.urlencoded({ extended: true }));

// Sessions
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));


app.get("/login", function (request, response) {
    // Check last login
    var last_login = 'First login!'
    if (typeof request.session.last_login != 'undefined') {
        last_login = request.session.last_login;
    }
    // Give a simple login form
    var welcome_msg = `Welcome, please log-in or register.`;
    if(typeof request.cookies.username != 'undefined') {
        welcome_msg = `Welcome ${request.cookies.username}`
    }
    str = `
<body>
${welcome_msg}
You last logged in on: ${last_login}<br>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>`
    ;
    response.send(str);
 });

 app.post("/login", function (request, response) {
    console.log(request.body);
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    if(typeof users[request.body.username] != 'undefined') {
    // Username exists, get stored password & check if it matches
        if(users[request.body.username].password == request.body.password) {
        request.session.last_login = new Date();
        response.cookie('username', request.body.username);
        response.send(`${request.body.username} is logged in`)
        }
        else {
        response.send(`Password invalid! ${str}`)
        }
        } else {
        response.send(`${request.body.username} does not exist! ${str}`)
    }
});


app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {
    // process a simple register form
    console.log(request.body);
    let username = request.body.username;
    if (users[username] = {}) {
    users[username].password = request.body.password;
    users[username].email = request.body.email;
    fs.writeFileSync(filename, JSON.stringify(user_data));
    response.redirect("/login");
}
else (response.redirect("/register"))
 });


app.listen(8080, () => console.log(`listening on port 8080`));



// ------ Cookies ------- // 

app.get("/set_cookie", function(request,response) {
    var my_name = 'Jon Machado';
    response.cookie('users_name', my_name)
    response.send(`Cookie sent for ${my_name}`);
})

app.get("/use_cookie", function(request, response) {
    var my_name = 'Jon Machado';
    response.cookie('users_name', my_name, '', {expire: 0});
    response.send(`Cookie used for ${my_name}`);
})

// ------ Session ------- // 

app.get("/use_session", function(request, response) {
    console.log(request.session);
    response.send(`Welcome! Your Session ID is ${request.session.id}`);
});