import { Usermodel } from "../../schemas/mongoose/user";

// Define the argument shape
interface RegisterArgs {
  username: string;
  password: string;
}

export const register = async (
  _: unknown,
  args: RegisterArgs
): Promise<typeof Usermodel.prototype> => {
  try {
    const { username, password } = args;

    const existing = await Usermodel.findOne({ username });
    if (existing) {
      throw new Error("Username already exists");
    }

    const user = new Usermodel({ username, password });
    const savedUser = await user.save();
    return savedUser;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred during registration");
  }
};
