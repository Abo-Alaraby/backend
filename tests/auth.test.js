const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { login, signupUser, signupAdmin, userDetails } = require("../APIs/User-Service/auth");
const User = require("../Database/Models/user-model");
const Admin = require("../Database/Models/admin-model");
const app = require("../index"); // Import the Express app

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("../Database/Models/user-model");
jest.mock("../Database/Models/admin-model");

describe("Authentication Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

  });

  describe("POST /user/login", () => {
    it("should return 200 and a token for valid admin login", async () => {
      const mockAdmin = { id: "1", email: "admin@test.com", password: "hashedpassword", firstName: "Admin" };
      Admin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      const res = await request(app).post("/user/login").send({ email: "admin@test.com", password: "password" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mockToken");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should return 200 and a token for valid user login if admin is not found", async () => {
      Admin.findOne.mockResolvedValue(null);
      const mockUser = {
        _id: "2",
        email: "testuser@example.com",
        password: "hashedpassword",
        firstName: "TestUser",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");
  
      const res = await request(app).post("/user/login").send({
        email: "testuser@example.com",
        password: "somepassword",
      });
  
      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mockToken");
      expect(res.body.message).toBe("Login successful");
    });

    it("should return 200 and a token for valid user login", async () => {
      const mockUser = { _id: "1", email: "user@test.com", password: "hashedpassword", firstName: "User" };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      const res = await request(app).post("/user/login").send({ email: "user@test.com", password: "password" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mockToken");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should return 404 for non-existent user", async () => {
      Admin.findOne.mockResolvedValue(null);
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/user/login").send({ email: "unknown@test.com", password: "password" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No such user exists");
    });

    it("should return 401 for invalid password", async () => {
      const mockUser = { id: "1", email: "user@test.com", password: "hashedpassword" };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post("/user/login").send({ email: "user@test.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });

    it("should return 401 for invalid admin password", async () => {
      const mockAdmin = { id: "1", email: "admin@test.com", password: "hashedpassword" };
      Admin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post("/user/login").send({ email: "admin@test.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });

    it("should return 500 for server error during login", async () => {
      Admin.findOne.mockRejectedValue(new Error("Server error"));

      const res = await request(app).post("/user/login").send({ email: "admin@test.com", password: "password" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Login failed, please try again later");
    });
  });

  describe("POST /user/signup", () => {
    it("should return 201 and a token for successful signup", async () => {
      const mockUser = { id: "1", email: "newuser@test.com", firstName: "User", save: jest.fn() };
      User.findOne.mockResolvedValue(null);
      Admin.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      jwt.sign.mockReturnValue("mockToken");

      User.mockImplementation(() => mockUser);

      const res = await request(app).post("/user/signup").send({
        email: "newuser@test.com",
        password: "password",
        firstName: "User",
        lastName: "Test",
        phone: "1234567890",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe("mockToken");
      expect(User).toHaveBeenCalled();
    });

    it("should return 400 for existing email", async () => {
      User.findOne.mockResolvedValue({ email: "existing@test.com" });

      const res = await request(app).post("/user/signup").send({
        email: "existing@test.com",
        password: "password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is already in use");
    });

    it("should return 400 if email exists as admin", async () => {
      Admin.findOne.mockResolvedValue({ email: "admin@test.com" });

      const res = await request(app).post("/user/signup").send({
        email: "admin@test.com",
        password: "password",
      });
      expect(res.body.message).toBe("Email is already in use");

      expect(res.status).toBe(400);
    });

    it("should return 500 for server error during signup", async () => {
      Admin.findOne.mockRejectedValue(new Error("Server error"));

      const res = await request(app).post("/user/signup").send({
        email: "ab@test.com",
        password: "password",
        firstName: "User",
        lastName: "Test",
      });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Signup failed, please try again later");
    });
  });

  describe("POST /admin/signup", () => {
    it("should return 201 and a token for successful admin signup", async () => {
      const mockAdmin = { id: "1", email: "newadmin@test.com", firstName: "Admin", save: jest.fn() };
      Admin.findOne.mockResolvedValue(null);
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      jwt.sign.mockReturnValue("mockToken");

      Admin.mockImplementation(() => mockAdmin);

      const res = await request(app).post("/admin/signup").send({
        email: "newadmin@test.com",
        password: "password",
        firstName: "Admin",
        lastName: "Test",
        phone: "1234567890",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe("mockToken");
      expect(Admin).toHaveBeenCalled();
    });

    it("should return 400 for existing admin email", async () => {
      Admin.findOne.mockResolvedValue({ email: "existingadmin@test.com" });

      const res = await request(app).post("/admin/signup").send({
        email: "existingadmin@test.com",
        password: "password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is already in use");
    });

    it("should return 400 if email exists as user", async () => {
      User.findOne.mockResolvedValue({ email: "user@test.com" });

      const res = await request(app).post("/admin/signup").send({
        email: "user@test.com",
        password: "password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is already in use");
    });

    it("should return 500 for server error during admin signup", async () => {
      Admin.findOne.mockRejectedValue(new Error("Server error"));

      const res = await request(app).post("/admin/signup").send({
        email: "adminerror@test.com",
        password: "password",
        firstName: "Admin",
        lastName: "Test",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Signup failed, please try again later");
    });
  });
});
