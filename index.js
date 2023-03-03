const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(
	"mongodb+srv://root:root@theverybestapp.rm6mwue.mongodb.net/test"
);

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	role: String,
});

//Homepage Route
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});
//Login Route
app.get("/login.html", (req, res) => {
	res.sendFile(__dirname + "/static/login.html");
});

const User = mongoose.model("User", userSchema);
/*
const user = new User({
	username: "demo",
	email: "demo@demo.com",
	password: "demo",
	role: "admin",
});
user.save().then(
	() => console.log("Usuário Cadastrado"),
	(err) => console.log(err)
);
*/
app.post("/login.html", async (req, res) => {
	try {
		const data = req.body;
		const { username, password } = data;
		const users = await User.findOne({
			username: username,
			password: password,
		});
		res.send(users);
		console.log(users.role);
	} catch (err) {
		console.log(err);
	}
});

/*
app.post("/login.html", (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	res.send(`Username: ${username} Password: ${password}`);
});
*/
app.listen(port, () => console.log(`App is listening port ${port}`));
