import bcrypt from "bcryptjs"; // Add bcrypt for password hashing
import { Usermodel } from "../../schemas/mongoose/user"; // Assuming Usermodel is your mongoose model

// Define the argument shape
interface RegisterArgs {
  email: string;
  password: string;
}

export const register = async (
  _: unknown,
  args: RegisterArgs
): Promise<Pick<typeof Usermodel.prototype, "email">> => {
  // Only return the email of the user
  try {
    const { email, password } = args;

    // Check if the user already exists
    const existing = await Usermodel.findOne({ email });
    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new Usermodel({ email, password: hashedPassword });

    // Save the user to the database
    const savedUser = await user.save();

    // Return only the necessary information (e.g., email)
    return { email: savedUser.email };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message); // Throw the error message if it's an instance of Error
    }
    throw new Error("Unknown error occurred during registration");
  }
};
