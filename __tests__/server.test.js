const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Server Tests", () => {
  test("GET / should render the student login page", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Student Login"); // Check if the page contains "Student Login"
  });

  test("GET /auth should return 404 if no route is defined", async () => {
    const response = await request(app).get("/auth");
    expect(response.status).toBe(404);
  });

  test("GET /dashboard should return 404 if no route is defined", async () => {
    const response = await request(app).get("/dashboard");
    expect(response.status).toBe(404);
  });
});

afterAll(async () => {
    await mongoose.connection.close();
  });