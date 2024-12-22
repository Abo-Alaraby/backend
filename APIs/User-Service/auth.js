const User = require("../../Database/Models/user-model");

const Admin = require("../../Database/Models/admin-model");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

async function generateToken(id, name, email, role) {
  const token = jwt.sign(
    { id, email, name, role },

    SECRET_KEY,

    { expiresIn: "7d" }
  );

  return token;
}

async function validatePassword(passedPassword, storedPassword) {
  const response = await bcrypt.compare(passedPassword, storedPassword);

  return response;
}

async function userDetails(req, res) {
  const email = req.user.email;
  const admin = await Admin.findOne({ email }).select("-password -createdAt -deletedAt -updatedAt");
  if (admin) {
    return res.status(200).json({ user: admin, role: "admin" });
  }
  const user = await User.findOne({ email }).select("-password -createdAt -deletedAt -updatedAt");
  if (!user) {
    return res.status(404).json({ message: `user not found with email specified: ${email}` });
  }
  return res.status(200).json({ user, role: "user" });
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email });

    if (admin) {
      const validPassword = await validatePassword(password, admin.password);

      if (!validPassword) return res.status(401).json({ message: "Invalid password" });

      const token = await generateToken(admin.id, admin.firstName, admin.email, "admin");

      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "Strict",
      });

      return res.status(200).json({ message: "Login successful", token });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      const validPassword = await validatePassword(password, user.password);

      if (!validPassword) return res.status(401).json({ message: "Invalid password" });

      const token = await generateToken(user._id, user.firstName, user.email, "user");

      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "Strict",
      });

      return res.status(200).json({ message: "Login successful", token });
    }

    return res.status(404).json({ message: "No such user exists" });
  } catch (error) {
    res.status(500).json({ message: "Login failed, please try again later" });
  }
}

//This is Signup For users only
async function signupUser(req, res) {
  const { email, firstName, lastName, password, phone } = req.body;

  try {
    const existsAsAdmin = await Admin.findOne({ email });

    if (existsAsAdmin) return res.status(400).json({ message: "Email is already in use" });

    const existsAsUser = await User.findOne({ email });

    if (existsAsUser) return res.status(400).json({ message: "Email is already in use" });

    //Hash the password
    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, firstName, lastName, password: hashedPassword, phone });

    await newUser.save();

    const token = await generateToken(newUser._id, newUser.firstName, newUser.email, "user");

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    res.status(201).json({ message: "Signup successful, you'll be redirected to log in.", token });
  } catch (error) {
    res.status(500).json({ message: "Signup failed, please try again later" });
  }
}

async function signupAdmin(req, res) {
  const { email, firstName, lastName, password, phone } = req.body;

  try {
    const existsAsAdmin = await Admin.findOne({ email });

    if (existsAsAdmin) return res.status(400).json({ message: "Email is already in use" });

    const existsAsUser = await User.findOne({ email });

    if (existsAsUser) return res.status(400).json({ message: "Email is already in use" });

    //Hash the password
    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ email, firstName, lastName, password: hashedPassword, phone });

    await newAdmin.save();

    const token = await generateToken(newAdmin._id, newAdmin.firstName, newAdmin.email, "admin");

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    res.status(201).json({ message: "Signup successful, you'll be redirected to log in.", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Signup failed, please try again later" });
  }
}

module.exports = { login, signupUser, signupAdmin, userDetails };
