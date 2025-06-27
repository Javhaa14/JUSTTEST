import { Messagemodel } from "../../schemas/mongoose/message";
import { Usermodel } from "../../schemas/mongoose/user";

// Define the arguments for the resolver
interface AddMessageArgs {
  username: string;
  content: string;
}

// You can replace `any` below with a context type if you're using one
export const addMessage = async (
  _: unknown,
  args: AddMessageArgs
): Promise<typeof Messagemodel.prototype> => {
  try {
    const { username, content } = args;

    const user = await Usermodel.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const message = new Messagemodel({ username, content });
    await message.save();
    return message;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred");
  }
};
