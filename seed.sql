USE employee_tracker;

INSERT INTO
    department (id, name)
VALUES
    (1, 'Engineering'),
    (2, 'Accounting'),
    (3, 'Shipping'),
    (4, 'Leadership');

INSERT INTO
    role (id, title, salary, department_id)
VALUES
    (1, 'Front End', 5.00, 1),
    (2, 'Back End', 5.00, 1),
    (3, 'Accountant', 3.50, 2),
    (4, 'Fullfillment', 2.00, 3),
    (5, 'Royalty', 1000000.99, 4);

INSERT INTO
    employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, 'Michael', 'Bubel', 5, NULL),
    (2, 'George', 'Washington', 1, 1),
    (3, 'Herb', 'Johnson', 2, NULL),
    (4, 'Kyle', 'McIntosh', 3, 1),
    (5, 'Bear', 'Pup', 4, 1);