const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDB } = require("../config/db");

let mongoServer;

beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Mock the environment variable for the database URL
  process.env.DB_URL = uri;

  // Connect to the in-memory database
  await connectDB();
});

afterAll(async () => {
  // Close the database connection and stop the in-memory server
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Database Tests", () => {
  test("should connect to the database successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  test("should handle database operations", async () => {
    // Example schema and model
    const UserSchema = new mongoose.Schema({ name: String });
    const User = mongoose.model("User", UserSchema);

    // Insert a document
    const user = await User.create({ name: "John Doe" });
    expect(user.name).toBe("John Doe");

    // Find the document
    const foundUser = await User.findOne({ name: "John Doe" });
    expect(foundUser.name).toBe("John Doe");

    // Delete the document
    await User.deleteOne({ name: "John Doe" });
    const deletedUser = await User.findOne({ name: "John Doe" });
    expect(deletedUser).toBeNull();
  });
});