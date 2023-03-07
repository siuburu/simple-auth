const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let username;
let password;

rl.question("Enter a username: ", (answer) => {
	username = answer;
	rl.question("Enter a password: ", (answer) => {
		password = answer;
		console.log(`User ${username} registered with password ${password}.`);
		rl.close();
	});
});
