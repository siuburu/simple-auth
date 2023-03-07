const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const twofactor = require("node-2fa");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	session({
		secret: "monster",
		resave: false,
		saveUninitialized: true,
	})
);

mongoose.connect(
	"mongodb+srv://root:root@theverybestapp.rm6mwue.mongodb.net/test"
);

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	role: String,
	twofa: String,
	secret: String,
});
const User = mongoose.model("User", userSchema);
/*
//Homepage Route
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});
//Login Route
app.get("/login", (req, res) => {
	res.sendFile(__dirname + "/static/login.html");
});
app.get("/new_user", (req, res) => {
	res.sendFile(__dirname + "/static/new_user.html");
});
app.get("/user", (req, res) => {
	res.sendFile(__dirname + "/static/user.html");
});


//post da pagina de login
app.post("/login", async (req, res) => {
	try {
		const data = req.body;
		const { username, password } = data;
		const users = await User.findOne({
			username: username,
		});
		if (users.password !== password) {
			console.log("Senha incorreta");
			res.redirect("/login");
		} else {
			//se user for adm manda pra pag de cadastro, qualquer outro user retorna o Json do user
			req.session.user = { id: users.username };
			users.role == "admin" ? res.redirect("/new_user") : res.redirect("/user");
		}
	} catch (err) {
		console.log(err);
	}
});

//cadastra usuário no banco
app.post("/new_user", async (req, res) => {
	const data = req.body;
	const { username, password, email, role } = data;
	const user = new User({
		username: username,
		email: email,
		password: password,
		role: role,
	});
	user.save().then(
		() => console.log("Usuário cadastrado"),
		(err) => console.log(err)
	);
});
app.post("/user", (req, res) => {
	const generateOTP = async (req, res) => {
		try {
			const user_id = req.session.user.id;
			const newSecret = twofactor.generateSecret({
				name: "simple-auth",
				account: user_id,
			});
			await User.findOneAndUpdate(
				{
					username: user_id,
				},
				{
					secret: newSecret.secret,
				}
			);

			console.log("2fa habilitado");
		} catch (err) {
			console.log(err);
		}
	};
});
*/
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function displayMenu() {
	console.log("Welcome to the Terminal App!");
	console.log("1. Register User");
	console.log("2. Sign In");
	console.log("3. Exit");
	rl.question("Enter your choice: ", (choice) => {
		switch (choice) {
			case "1":
				registerUser();
				break;
			case "2":
				signIn();
				break;
			case "3":
				console.log("Exiting the app...");
				rl.close();
				break;
			default:
				console.log("Invalid choice! Please try again.");
				displayMenu();
		}
	});
}

function registerUser() {
	console.log("Register User selected.");

	let username;
	let password;
	let role;
	rl.question("Enter a username: ", (answer) => {
		username = answer;
		rl.question("Enter a password: ", (answer) => {
			password = answer;
			rl.question("Enter user role(admin/user): ", (answer) => {
				role = answer;
				const user = new User({
					username: username,
					password: password,
					role: role,
					twofa: "disabled",
				});
				user.save().then(
					() => {
						console.log("Usuário cadastrado");
						displayMenu();
					},
					(err) => console.log(err)
				);
			});
		});
	});
}
function askQuestion(question) {
	return new Promise((resolve) => {
		rl.question(question, resolve);
	});
}
function displaySystemMenu(username) {
	console.log(`Hello ${username} what we gonna do today?`);
	console.log("1. Enable 2FA");
	console.log("2. Disable 2FA");
	rl.question("Enter your choice: ", (choice) => {
		switch (choice) {
			case "1":
				enable2fa(username);
				break;
			case "2":
				disable2fa(username);
				break;
			default:
				console.log("Invalid choice! Please try again.");
				displayMenu();
		}
	});
}

async function enable2fa(user) {
	const newSecret = twofactor.generateSecret({
		name: "simple-auth",
		account: "user",
	});
	await User.findOneAndUpdate(
		{
			username: user,
		},
		{
			secret: newSecret.secret,
			twofa: "enabled",
		}
	);
	console.log("2fa enabled");
}
async function disable2fa(user) {
	await User.findOneAndUpdate(
		{
			username: user,
		},
		{
			twofa: "disabled",
		}
	);
	console.log("2fa disabled");
}
async function signIn() {
	console.log("Sign In selected.");
	let username;
	let password;
	let token;
	username = await askQuestion("Enter a username: ");
	password = await askQuestion("Enter a password: ");
	const users = await User.findOne({
		username: username,
	});
	if (users.password !== password) {
		console.log("Incorrect password");
		signIn();
	} else {
		//se user for adm manda pra pag de cadastro, qualquer outro user retorna o Json do u
		if (users.twofa === "enabled") {
			token = await askQuestion("Enter verification token:");
			if (twofactor.verifyToken(users.secret, token)) {
				console.log("valid token");
			} else {
				console.log("invalid token");
				signIn();
			}
		}
		console.log("Welcome " + users.role);
		displaySystemMenu(users.username);
	}
}
displayMenu();
app.listen(port, () => console.log(`App is listening port ${port}`));
