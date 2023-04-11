const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

const fs = require("fs");
const usersFile = "users.json";

let users = {};
if (fs.existsSync(usersFile)) {
    const data = fs.readFileSync(usersFile, "utf-8");
    users = JSON.parse(data);
    console.log(users);
} else {
    console.log("Sorry, file " + usersFile + " does not exist.");
    process.exit(1);
}

app.get("/login", function (req, res) {
    // Give a simple login form
    const form = `
        <body>
            <form action="/login" method="POST">
                <input type="text" name="username" size="40" placeholder="Enter username"><br>
                <input type="password" name="password" size="40" placeholder="Enter password"><br>
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
    `;
    res.send(form);
});

app.post("/login", function (req, res) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    const username = req.body.username;
    const password = req.body.password;
    console.log("User name=" + username + " password=" + password);

    if (users[username]) {
        if (users[username].password === password) {
            res.send(`Good login for user ${username}`);
        } else {
            res.redirect("/login?error='Bad password'");
        }
    } else {
        res.redirect("/login?error='No such user'");
    }
});

app.get("/register", function (req, res) {
    // Give a simple register form
    const form = `
        <body>
            <form action="/register" method="POST">
                <input type="text" name="username" size="40" placeholder="Enter username"><br>
                <input type="password" name="password" size="40" placeholder="Enter password"><br>
                <input type="password" name="repeat_password" size="40" placeholder="Enter password again"><br>
                <input type="email" name="email" size="40" placeholder="Enter email"><br>
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
    `;
    res.send(form);
});

app.post("/register", function (req, res) {
    // Process a simple registration form
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const passwordRepeat = req.body.repeat_password;

    if (users[username]) {
        res.send(`User ${username} already exists!`);
        return;
    }

    if (password !== passwordRepeat) {
        res.send("Passwords do not match!");
        return;
    }

    users[username] = {
        name: username,
        password: password,
        email: email
    };

    const data = JSON.stringify(users);
    fs.writeFileSync(usersFile, data, "utf-8");

    res.send("Got a registration");
});

app.listen(8080, () => console.log(`Listening on port 8080`));
