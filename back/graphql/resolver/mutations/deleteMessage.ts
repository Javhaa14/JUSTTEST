import { Messagemodel } from "../../schemas/mongoose/message";

export const deleteMessage = async (_, { id }) => {
  try {
    const result = await Messagemodel.findByIdAndDelete(id);
    return result !== null;
  } catch (err) {
    throw new Error(err.message);
  }
};
