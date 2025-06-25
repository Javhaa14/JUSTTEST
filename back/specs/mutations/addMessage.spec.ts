import { addMessage } from "../../graphql/resolver/mutations/addMessage";
import { Usermodel } from "../../graphql/schemas/mongoose/user";
import { Messagemodel } from "../../graphql/schemas/mongoose/message";

// Mock Mongoose Models
jest.mock("../../graphql/schemas/mongoose/user", () => ({
  Usermodel: {
    findOne: jest.fn(),
  },
}));

jest.mock("../../graphql/schemas/mongoose/message", () => ({
  Messagemodel: jest.fn(),
}));

const mockFindOne = Usermodel.findOne as jest.Mock;
const mockSave = jest.fn();

describe("addMessage resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error if user is not found", async () => {
    mockFindOne.mockResolvedValue(null);

    await expect(
      addMessage(null, { username: "nouser", content: "Hello" })
    ).rejects.toThrow("User not found");

    expect(mockFindOne).toHaveBeenCalledWith({ username: "nouser" });
  });

  it("creates and saves a message if user is found", async () => {
    mockFindOne.mockResolvedValue({ username: "user1" });

    // Mock Messagemodel constructor to return object with .save
    (Messagemodel as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
      username: "user1",
      content: "Hello",
    }));

    mockSave.mockResolvedValue(true);

    const result = await addMessage(null, {
      username: "user1",
      content: "Hello",
    });

    expect(mockFindOne).toHaveBeenCalledWith({ username: "user1" });
    expect(Messagemodel).toHaveBeenCalledWith({
      username: "user1",
      content: "Hello",
    });
    expect(mockSave).toHaveBeenCalled();
    expect(result).toMatchObject({
      username: "user1",
      content: "Hello",
    });
  });

  it("throws error if message save fails", async () => {
    mockFindOne.mockResolvedValue({ username: "user1" });

    (Messagemodel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    }));

    await expect(
      addMessage(null, { username: "user1", content: "Hello" })
    ).rejects.toThrow("Save failed");
  });
});
