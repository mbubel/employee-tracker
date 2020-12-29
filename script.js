console.log("Employee Tracker");
let mysql = require("mysql");
let inquirer = require("inquirer");

let connection = mysql.createConnection({
  host: "localhost",

  // User Port
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "blinkM123",
  database: "employee_tracker",
});

connection.connect(function (err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
  inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "Add a department",
      "Add a role",
      "Add an employee",
      "View departments",
      "View roles",
      "View employees",
      "Update employee role",
      "Exit"

    ],
  });
}
