const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { ApolloServer, gql } = require("apollo-server-express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/livechat";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB fails
  });

// 💬 Message schema
const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// 👤 User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// GraphQL Schema Definition
const typeDefs = gql`
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

// GraphQL Resolvers
const resolvers = {
  Query: {
    messages: async () => {
      try {
        return await Message.find().sort({ createdAt: 1 }).limit(100);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    users: async () => {
      try {
        return await User.find();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    addMessage: async (_, { username, content }) => {
      try {
        const message = new Message({ username, content });
        await message.save();
        return message;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteMessage: async (_, { id }) => {
      try {
        const result = await Message.findByIdAndDelete(id);
        return result !== null;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    register: async (_, { username, password }) => {
      try {
        const existing = await User.findOne({ username });
        if (existing) {
          throw new Error("Username already exists");
        }
        const user = new User({ username, password });
        await user.save();
        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    login: async (_, { username, password }) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid credentials");
        }
        const isPasswordValid = password === user.password; // Simplified for now
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Generate JWT token
        const token = "your_jwt_token"; // This should be generated properly with JWT
        return token;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};

// Create Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await apolloServer.start(); // Start Apollo Server

  apolloServer.applyMiddleware({ app, path: "/graphql" }); // Apply middleware after the server is started
  app.use(cors());
  app.use(express.json());

  // Start the Express server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
  });
}

startServer(); // Call the async function to start the server
