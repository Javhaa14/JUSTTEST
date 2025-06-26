import { deleteMessage } from "../../graphql/resolver/mutations/deleteMessage";
import { Messagemodel } from "../../graphql/schemas/mongoose/message";

jest.mock("../../graphql/schemas/mongoose/message", () => ({
  Messagemodel: {
    findByIdAndDelete: jest.fn(),
  },
}));

const mockDelete = Messagemodel.findByIdAndDelete as jest.Mock;

describe("deleteMessage resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true if a message was deleted", async () => {
    mockDelete.mockResolvedValue({ _id: "123", content: "bye" });

    const result = await deleteMessage(null, { id: "123" });

    expect(mockDelete).toHaveBeenCalledWith("123");
    expect(result).toBe(true);
  });

  it("returns false if no message was found", async () => {
    mockDelete.mockResolvedValue(null);

    const result = await deleteMessage(null, { id: "notfound" });

    expect(result).toBe(false);
  });

  it("throws an error on DB failure", async () => {
    mockDelete.mockRejectedValue(new Error("DB error"));

    await expect(deleteMessage(null, { id: "123" })).rejects.toThrow(
      "DB error"
    );
  });
});
