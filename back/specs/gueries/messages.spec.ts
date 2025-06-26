import { messages } from "../../graphql/resolver/queries/messages";
import { Messagemodel } from "../../graphql/schemas/mongoose/message";

jest.mock("../../graphql/schemas/mongoose/message", () => ({
  Messagemodel: {
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        limit: jest.fn(),
      })),
    })),
  },
}));

const mockFind = Messagemodel.find as jest.Mock;

describe("messages resolver", () => {
  it("returns messages sorted by createdAt", async () => {
    const mockLimit = jest.fn().mockResolvedValue([{ content: "Hello" }]);
    const mockSort = jest.fn(() => ({ limit: mockLimit }));
    mockFind.mockReturnValue({ sort: mockSort });

    const result = await messages();

    expect(mockFind).toHaveBeenCalled();
    expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(mockLimit).toHaveBeenCalledWith(100);
    expect(result).toEqual([{ content: "Hello" }]);
  });

  it("throws an error if the query fails", async () => {
    const mockLimit = jest.fn().mockRejectedValue(new Error("Query failed"));
    const mockSort = jest.fn(() => ({ limit: mockLimit }));
    mockFind.mockReturnValue({ sort: mockSort });

    await expect(messages()).rejects.toThrow("Query failed");
  });
});
