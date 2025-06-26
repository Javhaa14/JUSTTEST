import { Messagemodel } from "../../schemas/mongoose/message";
import { Usermodel } from "../../schemas/mongoose/user";

export const addMessage = async (_, { username, content }) => {
  try {
    const user = await Usermodel.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const message = new Messagemodel({ username, content });
    await message.save();
    return message;
  } catch (err) {
    throw new Error(err.message);
  }
};
