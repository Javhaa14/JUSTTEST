import { Usermodel } from "../../schemas/mongoose/user";

export const users = async (): Promise<(typeof Usermodel.prototype)[]> => {
  try {
    return await Usermodel.find();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred while fetching users");
  }
};
