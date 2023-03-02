db.createCollection("users");

db.users.insertOne({
	username: "demo",
	email: "demo@demo.com",
	password: "demo",
});
