import { Usermodel } from "../../schemas/mongoose/user";

// Define the argument shape
interface LoginArgs {
  username: string;
  password: string;
}

// Return type: you can return a token string, or define a more complex object type
export const login = async (_: unknown, args: LoginArgs): Promise<string> => {
  try {
    const { username, password } = args;

    const user = await Usermodel.findOne({ username });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // ⚠️ In a real app, use bcrypt to hash/compare passwords
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // ⚠️ Replace with real JWT generation
    const token = "your_jwt_token";
    return token;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred");
  }
};
