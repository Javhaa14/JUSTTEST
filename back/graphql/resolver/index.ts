import { addMessage } from "./mutations/addMessage";
import { deleteMessage } from "./mutations/deleteMessage";
import { messages } from "./queries/messages";
import { users } from "./queries/users";
import { login } from "./mutations/login";
import { register } from "./mutations/register";

// GraphQL Resolvers
export const resolvers = {
  Query: {
    messages,
    users,
  },
  Mutation: {
    addMessage,
    deleteMessage,
    register,
    login,
  },
};
