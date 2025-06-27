import { Messagemodel } from "../../schemas/mongoose/message";

export const messages = async (): Promise<
  (typeof Messagemodel.prototype)[]
> => {
  try {
    return await Messagemodel.find().sort({ createdAt: 1 }).limit(100);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred while fetching messages");
  }
};
