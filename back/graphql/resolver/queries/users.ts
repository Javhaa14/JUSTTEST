import { Usermodel } from "../../schemas/mongoose/user";

export const users = async () => {
  try {
    return await Usermodel.find();
  } catch (err) {
    throw new Error(err.message);
  }
};
