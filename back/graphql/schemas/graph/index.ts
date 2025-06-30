import { gql } from "apollo-server-express";

// GraphQL Schema Definition
export const typeDefs = gql`
  type Message {
    id: ID!
    email: String!
    content: String!
    createdAt: String!
  }

  type User {
    id: ID!
    email: String!
  }

  type Query {
    messages: [Message]
    users: [User]
  }

  type Mutation {
    addMessage(email: String!, content: String!): Message
    deleteMessage(id: ID!): Boolean
    register(email: String!, password: String!): User
    login(email: String!, password: String!): String # Returns JWT token
  }
`;
