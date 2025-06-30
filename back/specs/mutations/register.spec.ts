import { register } from "../../graphql/resolver/mutations/register";
import { Usermodel } from "../../graphql/schemas/mongoose/user";

// Mock the module and its class
jest.mock("../../graphql/schemas/mongoose/user", () => {
  const actual = jest.requireActual("../../graphql/schemas/mongoose/user");

  return {
    ...actual,
    Usermodel: jest.fn(),
  };
});

const mockFindOne = jest.fn();
const mockSave = jest.fn();

describe("register resolver unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // @ts-ignore - override static method
    Usermodel.findOne = mockFindOne;

    // Mock constructor to return an object with `.save`
    (Usermodel as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));
  });

  it("throws error if email exists", async () => {
    mockFindOne.mockResolvedValue({ email: "existingUser" });

    await expect(
      register(null, { email: "existingUser", password: "pass" })
    ).rejects.toThrow("email already exists");

    expect(mockFindOne).toHaveBeenCalledWith({ email: "existingUser" });
  });

  it("creates and returns user if email does not exist", async () => {
    mockFindOne.mockResolvedValue(null);
    const fakeUser = { email: "newUser", password: "pass" };
    mockSave.mockResolvedValue(fakeUser);

    const result = await register(null, fakeUser);

    expect(mockFindOne).toHaveBeenCalledWith({ email: "newUser" });
    expect(Usermodel).toHaveBeenCalledWith(fakeUser);
    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual(fakeUser);
  });

  it("throws error if save throws", async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockRejectedValue(new Error("Save failed"));

    await expect(
      register(null, { email: "newUser", password: "pass" })
    ).rejects.toThrow("Save failed");
  });
});
