import { gql } from "apollo-server-express";

// GraphQL Schema Definition
export const typeDefs = gql`
  type Message {
    id: ID!
    username: String!
    content: String!
    createdAt: String!
  }

  type User {
    id: ID!
    username: String!
  }

  type Query {
    messages: [Message]
    users: [User]
  }

  type Mutation {
    addMessage(username: String!, content: String!): Message
    deleteMessage(id: ID!): Boolean
    register(username: String!, password: String!): User
    login(username: String!, password: String!): String # Returns JWT token
  }
`;
