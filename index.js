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
app.get("/login", (req, res) => {
	res.sendFile(__dirname + "/static/login.html");
});
app.get("/new_user", (req, res) => {
	res.sendFile(__dirname + "/static/new_user.html");
});
const User = mongoose.model("User", userSchema);

//post da pagina de login
app.post("/login", async (req, res) => {
	try {
		const data = req.body;
		const { username, password } = data;
		const users = await User.findOne({
			username: username,
			password: password,
		});

		//se user for adm manda pra pag de cadastro, qualquer outro user retorna o Json do user
		users.role == "admin" ? res.redirect("/new_user") : res.send(users);
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

app.listen(port, () => console.log(`App is listening port ${port}`));
