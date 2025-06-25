import express, { Application } from "express";
import http from "http";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import { resolvers } from "./graphql/resolver";
import { typeDefs } from "./graphql/schemas/graph";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/livechat";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
  app.use(cors());
  app.use(express.json());
}

export { app, server, startApolloServer };

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  startApolloServer().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    });
  });
}
