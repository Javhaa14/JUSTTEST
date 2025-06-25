import { Messagemodel } from "../../schemas/mongoose/message";

export const messages = async () => {
  try {
    return await Messagemodel.find().sort({ createdAt: 1 }).limit(100);
  } catch (err) {
    throw new Error(err.message);
  }
};
