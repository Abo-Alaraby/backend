const jwt = require("jsonwebtoken");
const { authenticate, authorizeAdmin } = require("../Middleware/auth");

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  const mockReq = (headers = {}, cookies = {}) => ({
    headers,
    cookies,
  });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  const SECRET_KEY = "your_secret_key";
  process.env.SECRET_KEY = SECRET_KEY;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should return 401 if no token is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied. No token provided.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with a valid token", async () => {
      const req = mockReq({}, { jwt: "valid_token" });
      const res = mockRes();
      jwt.verify.mockReturnValue({ id: 1, role: "user" }); // Simulate a valid token
      await authenticate(req, res, mockNext);
      expect(jwt.verify).toHaveBeenCalledWith("valid_token", SECRET_KEY);
      expect(req.user).toEqual({ id: 1, role: "user" });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 403 if token is invalid or expired", async () => {
      const req = mockReq({}, { jwt: "invalid_token" });
      const res = mockRes();

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorizeAdmin", () => {
    it("should return 403 if the user is not an admin", () => {
      const req = { user: { role: "user" } };
      const res = mockRes();

      authorizeAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied. Admins only.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next if the user is an admin", () => {
      const req = { user: { role: "admin" } };
      const res = mockRes();

      authorizeAdmin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
