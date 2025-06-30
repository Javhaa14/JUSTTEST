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
      addMessage(null, { email: "nouser", content: "Hello" })
    ).rejects.toThrow("User not found");

    expect(mockFindOne).toHaveBeenCalledWith({ email: "nouser" });
  });

  it("creates and saves a message if user is found", async () => {
    mockFindOne.mockResolvedValue({ email: "user1" });

    // Mock Messagemodel constructor to return object with .save
    (Messagemodel as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
      email: "user1",
      content: "Hello",
    }));

    mockSave.mockResolvedValue(true);

    const result = await addMessage(null, {
      email: "user1",
      content: "Hello",
    });

    expect(mockFindOne).toHaveBeenCalledWith({ email: "user1" });
    expect(Messagemodel).toHaveBeenCalledWith({
      email: "user1",
      content: "Hello",
    });
    expect(mockSave).toHaveBeenCalled();
    expect(result).toMatchObject({
      email: "user1",
      content: "Hello",
    });
  });

  it("throws error if message save fails", async () => {
    mockFindOne.mockResolvedValue({ email: "user1" });

    (Messagemodel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    }));

    await expect(
      addMessage(null, { email: "user1", content: "Hello" })
    ).rejects.toThrow("Save failed");
  });
});
