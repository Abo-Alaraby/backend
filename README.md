# E-Commerce Website

## Description

This repository contains the backend code for an E-Commerce web application. It is built using the MERN stack and provides the necessary APIs for user authentication, authorization, browsing items, managing a cart, placing orders, and more.

## Tech Stack

- **Frontend:** React.js (not included in this repository)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Others:** Axios, JWT, Mongoose, Nodemailer, and more.

## Installation

Follow these steps to install and set up the backend:

1. **Clone the Repository**
   Clone the repository to your local machine:

```bash
  git clone https://github.com/Abo-Alaraby/backend.git
```

2. **Navigate to the Project Directory**

```bash
  cd backend
```

3. **Install Dependencies**
   Run this command in terminal:

```bash
  npm install
```

4. **Create a .env File**
   Create a .env file in the root directory and include the following environment variable: SECRET_KEY Your application's secret key for signing tokens (must remain confidential).

## Usage

**Start the Server**
Run this command to start the server:

```bash
  npm start
```

By default, the server will start on http://localhost:3000

## Dependencies

This project uses the following dependencies:

- **axios**: HTTP client for making API requests.
- **bcrypt**: Hashing passwords securely.
- **bcryptjs**: Alternative library for password hashing.
- **cookie-parser**: Parses cookies for session management.
- **cors**: Enables Cross-Origin Resource Sharing.
- **crypto**: Provides cryptographic functionality.
- **dotenv**: Loads environment variables from `.env`.
- **express**: Web framework for building APIs.
- **jsonwebtoken**: Creates and verifies JSON Web Tokens.
- **mongoose**: ODM library for MongoDB.
- **multer**: Middleware for handling file uploads.
- **nodemailer**: Sends emails from the backend.
- **nodemon**: Automatically restarts the server during development.

For a full list of dependencies and their versions, refer to the `package.json` file.

## Contributing

1. **Fork the repository**
2. **Create a new branch**
   Run this command in terminal:

```bash
  git checkout -b desired-branch-name
```

3. **Commit your changes**

```bash
  git commit -m "Add your comment"
```

4. **Push to your branch**

```bash
  git push origin desired-branch-name
```

5. **Submit a pull request**
