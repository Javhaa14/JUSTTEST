import { Messagemodel } from "../../schemas/mongoose/message";

// Define the args interface
interface DeleteMessageArgs {
  id: string;
}

// You can replace `any` below with a context type if needed
export const deleteMessage = async (
  _: unknown,
  args: DeleteMessageArgs
): Promise<boolean> => {
  try {
    const { id } = args;

    const result = await Messagemodel.findByIdAndDelete(id);
    return result !== null;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred");
  }
};
