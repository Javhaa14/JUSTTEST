import { Usermodel } from "../../schemas/mongoose/user";

export const register = async (_, { username, password }) => {
  try {
    const existing = await Usermodel.findOne({ username });
    if (existing) {
      throw new Error("Username already exists");
    }
    const user = new Usermodel({ username, password });
    const savedUser = await user.save();
    return savedUser;
  } catch (err) {
    throw new Error(err.message);
  }
};
