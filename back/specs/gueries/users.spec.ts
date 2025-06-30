import { users } from "../../graphql/resolver/queries/users";
import { Usermodel } from "../../graphql/schemas/mongoose/user";

jest.mock("../../graphql/schemas/mongoose/user", () => ({
  Usermodel: {
    find: jest.fn(),
  },
}));

const mockFind = Usermodel.find as jest.Mock;

describe("users resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns list of users", async () => {
    const mockUsers = [{ email: "user1" }, { email: "user2" }];
    mockFind.mockResolvedValue(mockUsers);

    const result = await users();
    expect(mockFind).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it("throws an error if find fails", async () => {
    mockFind.mockRejectedValue(new Error("DB Error"));

    await expect(users()).rejects.toThrow("DB Error");
  });
});
