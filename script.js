console.log("Employee Tracker");
let mysql = require("mysql");
let inquirer = require("inquirer");
let cTable = require("console.table");

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
  mainMenu();
});

let INITIAL_MENU_ITEMS = {
  ADD_DEPARTMENT: "Add a department",
  ADD_ROLE: "Add a role",
  ADD_EMPLOYEE: "Add an employee",
  VIEW_DEPARTMENTS: "View departments",
  VIEW_ROLES: "View roles",
  VIEW_EMPLOYEES: "View employees",
  UPDATE_EMPLOYEE_ROLE: "Update employee role",
  EXIT: "Exit",
};

function printResults(err, res) {
  if (err) throw err;
  console.log(" ");
  console.table(res);
  mainMenu();
}

function viewDepartments() {
  connection.query("SELECT name FROM department", printResults);
}

function viewRoles() {
  connection.query(
    `SELECT 
    d.name AS department, r.title, r.salary
FROM
    role r
        INNER JOIN
    department d ON r.department_id = d.id`,
    printResults
  );
}

function viewEmployees() {
  connection.query(
    `SELECT 
    e.first_name,
    e.last_name,
    d.name AS department,
    r.title,
    r.salary,
    m.first_name manager_first_name
FROM
    employee e
        INNER JOIN
    role r ON e.role_id = r.id
        LEFT JOIN
    employee m ON m.id = e.manager_id
        INNER JOIN
    department d ON r.department_id = d.id`,
    printResults
  );
}

function addDepartment() {
  inquirer
    .prompt({
      name: "action",
      type: "input",
      message: "What's the name of the new department?",
    })
    .then(function (answer) {
      connection.query(
        "INSERT INTO department (name) VALUES (?)",
        [answer.action],
        function (error) {
          if (error) throw err;
          mainMenu();
        }
      );
    });
}

function mainMenu() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        INITIAL_MENU_ITEMS.ADD_DEPARTMENT,
        INITIAL_MENU_ITEMS.ADD_ROLE,
        INITIAL_MENU_ITEMS.ADD_EMPLOYEE,
        INITIAL_MENU_ITEMS.VIEW_DEPARTMENTS,
        INITIAL_MENU_ITEMS.VIEW_ROLES,
        INITIAL_MENU_ITEMS.VIEW_EMPLOYEES,
        INITIAL_MENU_ITEMS.UPDATE_EMPLOYEE_ROLE,
        INITIAL_MENU_ITEMS.EXIT,
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case INITIAL_MENU_ITEMS.VIEW_DEPARTMENTS:
          viewDepartments();
          break;
        case INITIAL_MENU_ITEMS.VIEW_ROLES:
          viewRoles();
          break;
        case INITIAL_MENU_ITEMS.VIEW_EMPLOYEES:
          viewEmployees();
          break;
        case INITIAL_MENU_ITEMS.ADD_DEPARTMENT:
          addDepartment();
          break;
      }
    });
}
