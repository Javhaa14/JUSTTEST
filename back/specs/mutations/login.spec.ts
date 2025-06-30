// specs/mutations/login.spec.ts

import { login } from "../../graphql/resolver/mutations/login";
import { Usermodel } from "../../graphql/schemas/mongoose/user";

// Mock Usermodel and its findOne method
jest.mock("../../graphql/schemas/mongoose/user", () => {
  return {
    Usermodel: {
      findOne: jest.fn(),
    },
  };
});

const mockFindOne = Usermodel.findOne as jest.Mock;

describe("login resolver unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error if user not found", async () => {
    mockFindOne.mockResolvedValue(null); // simulate no user found

    await expect(
      login(null, { email: "nouser", password: "pass" })
    ).rejects.toThrow("Invalid credentials");

    expect(mockFindOne).toHaveBeenCalledWith({ email: "nouser" });
  });

  it("throws error if password is incorrect", async () => {
    mockFindOne.mockResolvedValue({
      email: "user1",
      password: "correctpass",
    });

    await expect(
      login(null, { email: "user1", password: "wrongpass" })
    ).rejects.toThrow("Invalid credentials");

    expect(mockFindOne).toHaveBeenCalledWith({ email: "user1" });
  });

  it("returns token if email and password are correct", async () => {
    mockFindOne.mockResolvedValue({
      email: "user1",
      password: "correctpass",
    });

    const token = await login(null, {
      email: "user1",
      password: "correctpass",
    });

    expect(token).toBe("your_jwt_token");
    expect(mockFindOne).toHaveBeenCalledWith({ email: "user1" });
  });

  it("throws error if findOne throws an error", async () => {
    mockFindOne.mockRejectedValue(new Error("Database failure"));

    await expect(
      login(null, { email: "user1", password: "pass" })
    ).rejects.toThrow("Database failure");
  });
});
