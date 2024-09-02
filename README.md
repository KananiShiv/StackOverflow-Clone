[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/tRxoBzS5)
Add design docs in *images/*

## Instructions to setup and run project

To set up the project, ensure that you have followed all the instructions provided under "Getting Started" in Programming Assignment 03 – Node.js, Express, MongoDB. Additionally, you will need to install some npm dependencies, including bcrypt for password security.

Steps to Set Up:
- Install NPM Dependencies: Run npm install in your project directory to install required dependencies.
- Populate the Database:
- Use the following command to populate the model: node server/init.js mongodb://127.0.0.1:27017/fake_so
Start the Server:

Execute npm start in your terminal to start both the server and the client.

--------------------------------------------------------------------------------------------------------->
Important Notes for Running the Project!!
When running the project for the first time, special attention is needed for logging in with initial users:

Initial User Login:
Admin and Regular User Passwords:
When the database is initially populated, passwords for the created users are displayed in the terminal. These passwords are hashed and will need to be used directly for login.
Example Output:
User created: {
  username: 'adminUser',
  email: 'admin@example.com',
  password: '$2b$10$...',
  role: 'admin',
  ...
}
User created: {
  username: 'regularUser',
  email: 'user@example.com',
  password: '$2b$10$...',
  role: 'user',
  ...
}

So for example, if you want to login as the admin, the email will be admin@example.com and password will be the hashed part starting with $2b$10$. 
Note: It's crucial to record these passwords as they are necessary for the initial login.

--------------------------------------------------------------------------------------------------------->
Final Notes
This project does not heavily utilize CSS for styling but focuses on functionality. We hope you enjoy using the application!

## Team Member 1 Contribution
PUSHKAR TADAY - User Cases 8-14 , debugging, UML.
## Team Member 2 Contribution
SHIV KANANI - User Cases 1-8, 14, 15, debugging, README.
