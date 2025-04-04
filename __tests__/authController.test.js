const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authController = require("../controllers/authController");

jest.mock("../models/user"); // Mock the User model
jest.mock("bcryptjs"); // Mock bcrypt
jest.mock("jsonwebtoken"); // Mock jsonwebtoken

describe("Auth Controller Tests", () => {
  let req, res;
beforeEach(() => {
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(), // Allow chaining
      json: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn(), // Mock redirect
      cookie: jest.fn(),
      clearCookie: jest.fn(), // Mock clearCookie
      send: jest.fn(),
    };
  });

 

  describe("getRegisterForm", () => {
    test("should render the student register page", () => {
      authController.getRegisterForm(req, res);
      expect(res.render).toHaveBeenCalledWith("student-register");
    });
  });

  describe("register", () => {
    test("should register a new user and redirect to the dashboard", async () => {
      req.body = {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        role: "student",
      };

      const mockUser = {
        _id: "12345",
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        role: "student",
        save: jest.fn().mockResolvedValueOnce({
          _id: "12345",
          name: "John Doe",
          email: "test@example.com",
          role: "student",
        }),
      };

      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue("mockToken");

      await authController.register(req, res);

      expect(User).toHaveBeenCalledWith(req.body);
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "12345", role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(res.cookie).toHaveBeenCalledWith("token", "mockToken", {
        httpOnly: true,
        secure: true,
      });
      expect(res.redirect).toHaveBeenCalledWith("/dashboard/student/12345");
    });

    test("should handle errors during registration", async () => {
      req.body = {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        role: "student",
      };

      User.mockImplementation(() => {
        throw new Error("Database error");
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Error: Database error");
    });
  });

  describe("login", () => {
    test("should log in a user and redirect to the dashboard", async () => {
        req.body = {
          email: "test@example.com",
          password: "password123",
        };
      
        const mockUser = {
          _id: "12345",
          email: "test@example.com",
          password: "hashedPassword",
          role: "student",
        };
      
        User.findOne.mockResolvedValueOnce(mockUser); // Mock a valid user
        bcrypt.compare.mockResolvedValueOnce(true); // Mock password comparison
        jwt.sign.mockReturnValue("mockToken"); // Mock JWT generation
      
        await authController.login(req, res);
      
        expect(res.cookie).toHaveBeenCalledWith("token", "mockToken"); // Check if the token is set in a cookie
        // expect(res.redirect).toHaveBeenCalledWith("/dashboard/student/12345"); // Check if the user is redirected
      });

    test("should return 401 for invalid credentials", async () => {
      req.body = {
        email: "test@example.com",
        password: "wrongPassword",
      };
  
      const mockUser = {
        _id: "12345",
        email: "test@example.com",
        password: "hashedPassword",
        role: "student",
      };
  
      User.findOne.mockResolvedValueOnce(mockUser); // Mock a valid user
      bcrypt.compare.mockResolvedValueOnce(false); // Mock password mismatch
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Invalid credentials");
    });
  
  
    test("should handle server errors", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };
  
      User.findOne.mockRejectedValueOnce(new Error("Database error")); // Mock a database error
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });


  // describe("logout", () => {
  //   test("should clear the token cookie and redirect to login", () => {
  //     // Call the logout function
  //     authController.logout(req, res);
  
  //     // Debugging logs
  //     console.log(res.clearCookie.mock.calls); // Logs calls to clearCookie
  //     console.log(res.redirect.mock.calls); // Logs calls to redirect
  
  //     // Assertions
  //     expect(res.clearCookie).toHaveBeenCalledWith("token");
  //     expect(res.redirect).toHaveBeenCalledWith("/auth/login");
  //   });
  // });

});