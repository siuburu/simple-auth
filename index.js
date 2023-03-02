const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.listen(3000, () => console.log("Server is running"));

mongoose.connect(
	"mongodb+srv://root:root@theverybestapp.rm6mwue.mongodb.net/test"
);

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	role: String,
});

const User = mongoose.model("User", userSchema);

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

app.get("/", async (req, res) => {
	try {
		const users = await User.find({});
		res.send(users);
		console.log(users);
	} catch (err) {
		console.log(err);
	}
});
