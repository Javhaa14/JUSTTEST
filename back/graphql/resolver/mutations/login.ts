import { Usermodel } from "../../schemas/mongoose/user";

export const login = async (_, { username, password }) => {
  try {
    const user = await Usermodel.findOne({ username });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = "your_jwt_token";
    return token;
  } catch (err) {
    throw new Error(err.message);
  }
};
