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
  UPDATE_EMPLOYEE_MANAGER: "Update employee manager",
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

function addRole() {
  connection.query("SELECT id, name FROM department", function (err, res) {
    if (err) throw err;
    let departments = res.map(function (r) {
      return { name: r.name, value: r.id };
    });

    let questions = [
      {
        name: "department",
        type: "list",
        message: "Select the department you'd like to add the role to",
        choices: departments,
      },
      {
        name: "title",
        type: "input",
        message: "What is the title of the role? ",
      },

      {
        name: "salary",
        type: "input",
        message: "What is the salary for this role? ",
        validate: function (value) {
          return !isNaN(value);
        },
      },
    ];

    inquirer.prompt(questions).then(function (answers) {
      connection.query(
        "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
        [answers.title, answers.salary, answers.department],
        function (error) {
          if (error) throw error;
          mainMenu();
        }
      );
    });
  });
}

function addEmployee() {
  connection.query("SELECT title, id FROM role", function (err, res) {
    if (err) throw err;
    connection.query(
      "SELECT id, first_name, last_name FROM employee",
      function (errTwo, employeeResults) {
        if (errTwo) throw errTwo;
        let roles = res.map(function (m) {
          return { name: m.title, value: m.id };
        });
        let employees = employeeResults.map(function (e) {
          return { name: e.first_name + " " + e.last_name, value: e.id };
        });
        employees.push({
          name: "No Manager",
          value: null,
        });
        let employeeQuestions = [
          {
            name: "role",
            type: "list",
            message: "What is their role?",
            choices: roles,
          },
          {
            name: "manager",
            type: "list",
            message: "Who is their manager?",
            choices: employees,
          },
          {
            name: "first_name",
            type: "input",
            message: "What is their first name?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is their last name?",
          },
        ];
        inquirer.prompt(employeeQuestions).then(function (answers) {
          connection.query(
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
            [
              answers.first_name,
              answers.last_name,
              answers.role,
              answers.manager,
            ],
            function (error) {
              if (error) {
                console.log(error);
                throw error;
              }
              mainMenu();
            }
          );
        });
      }
    );
  });
}

function updateEmployee() {
  connection.query(
    "SELECT id, first_name, last_name FROM employee",
    function (err, employeeResults) {
      if (err) throw err;
      connection.query(
        "SELECT id, title FROM role",
        function (errTwo, roleResults) {
          if (errTwo) throw errTwo;
          let roles = roleResults.map(function (m) {
            return { name: m.title, value: m.id };
          });
          let employees = employeeResults.map(function (e) {
            return { name: e.first_name + " " + e.last_name, value: e.id };
          });

          let employeeUpdateQuestions = [
            {
              name: "employee",
              type: "list",
              message: "Who do you want to update?",
              choices: employees,
            },
            {
              name: "role",
              type: "list",
              message: "What is their new role?",
              choices: roles,
            },
          ];
          inquirer.prompt(employeeUpdateQuestions).then(function (answers) {
            connection.query(
              "UPDATE employee SET role_id = ? WHERE id = ?",
              [answers.role, answers.employee],
              function (error) {
                if (error) {
                  console.log(error);
                  throw error;
                }
                mainMenu();
              }
            );
          });
        }
      );
    }
  );
}

function updateManager() {
  connection.query(
    "SELECT id, first_name, last_name FROM employee",
    function (err, empRes) {
      if (err) throw err;
      let managersOne = empRes.map(function (m) {
        return { name: m.first_name + " " + m.last_name, value: m.id };
      });
      connection.query(
        "SELECT id, title FROM role",
        function (errThree, managerResults) {
          if (errThree) throw errThree;
          let managerUpdateQuestions = [
            {
              name: "employee",
              type: "list",
              message: "Who is the new manager?",
              choices: managersOne,
            },
            {
              name: "manager",
              type: "list",
              message: "Who are they managing?",
              choices: managersOne,
            },
          ];
          inquirer.prompt(managerUpdateQuestions).then(function (answers) {
            connection.query(
              "UPDATE employee SET manager_id = ? WHERE id = ?",
              [answers.employee, answers.manager],
              function (error) {
                if (error) {
                  console.log(error);
                  throw error;
                }
                mainMenu();
              }
            );
          });
        }
      );
    }
  );
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
        INITIAL_MENU_ITEMS.UPDATE_EMPLOYEE_MANAGER,
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
        case INITIAL_MENU_ITEMS.ADD_ROLE:
          addRole();
          break;
        case INITIAL_MENU_ITEMS.ADD_EMPLOYEE:
          addEmployee();
          break;
        case INITIAL_MENU_ITEMS.UPDATE_EMPLOYEE_ROLE:
          updateEmployee();
          break;
        case INITIAL_MENU_ITEMS.UPDATE_EMPLOYEE_MANAGER:
          updateManager();
          break;
      }
    });
}
