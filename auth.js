const mongoose = require("mongoose");
const prompt = require("prompt-sync")();
const twofactor = require("node-2fa");
const bcrypt = require("bcrypt");
mongoose.set("strictQuery", true);
mongoose.connect(
	"mongodb+srv://root:root@theverybestapp.rm6mwue.mongodb.net/test"
);
//esquema de usuário no banco
const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	role: String,
	twofa: String,
	secret: String,
});
const User = mongoose.model("User", userSchema);
const saltRounds = 10;

const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
//Menu inicial
function displayMenu() {
	console.log("Welcome to the Terminal App!");
	console.log("1. Register User");
	console.log("2. Sign In");
	console.log("3. Exit");
	choice = prompt("Enter your choice: ");
	switch (choice) {
		case "1":
			registerUser();
			break;
		case "2":
			signIn();
			break;
		case "3":
			console.log("Exiting the app...");
			process.exit(0);
		default:
			console.log("Invalid choice! Please try again.");
			displayMenu();
	}
}
//registra usuário e utiliza bcrypt pra salvar o hash da senha no banco
function registerUser() {
	console.log("Register User selected.");

	let username;
	let password;
	let role;

	username = prompt("Enter a username: ");
	password = bcrypt.hashSync(prompt("Enter a password: "), saltRounds);
	role = prompt("What is the role?(admin/user)");
	const user = new User({
		username: username,
		password: password,
		role: role,
		twofa: "disabled",
	});
	user.save().then(
		() => {
			console.clear();
			console.log("Usuário cadastrado");
			displayMenu();
		},
		(err) => console.log(err)
	);
}
//lista os usuários cadastrados
async function listUsers() {
	await User.find(
		{},
		{
			username: 1,
			_id: 0,
		}
	).then((res) => {
		console.log(res);
	});
}
async function deleteUser(deleteUsername) {
	let confirm = prompt("Are you sure you want to delete this user?");
	if (confirm === "y") {
		await User.findOneAndDelete({
			username: deleteUsername,
		});
	} else if (confirm === "n") {
		displaySystemMenu();
	}
}
//menu de usuário logado
function displaySystemMenu(username) {
	console.log(`Hello ${username} what we gonna do today?`);
	console.log("1. Enable 2FA");
	console.log("2. Disable 2FA");
	console.log("3. List users");
	choice = prompt("Enter your choice: ");
	switch (choice) {
		case "1":
			enable2fa(username);
			break;
		case "2":
			disable2fa(username);
			break;
		case "3":
			listUsers();
			break;
		default:
			console.log("Invalid choice! Please try again.");
			displaySystemMenu(username);
	}
}
//funçao que gera e habilita o 2fa
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
	console.log("Open the following link in a browser to see the QR code:");
	console.log(newSecret.qr);
	console.log(`Here is your 32 character secret: ${newSecret.secret}`);
}
//desabilita o 2fa na entrada do banco
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
//loga o usuário e verifica a role dele.
async function signIn() {
	console.log("Sign In selected.");
	let username;
	let password;
	let token;
	username = prompt("Enter a username: ");
	password = prompt("Enter a password: ");
	const users = await User.findOne({
		username: username,
	});
	const match = await bcrypt.compare(password, users.password);
	console.log(match);
	if (!match) {
		console.log("Incorrect password");
		signIn();
	} else {
		if (users.twofa === "enabled") {
			token = await prompt("Enter verification token:");
			if (twofactor.verifyToken(users.secret, token)) {
				console.log("valid token");

				console.log("Welcome " + users.role);

				displaySystemMenu(users.username);
			} else {
				console.clear();
				console.log("invalid token");
				displayMenu();
			}
		} else {
			displaySystemMenu(users.username);
		}
	}
}
displayMenu();
