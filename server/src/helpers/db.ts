/**
 * Database Connection Helper
 *
 * Responsibilities:
 * - Establishes and manages a MongoDB connection using Mongoose.
 * - Logs connection status and errors for observability.
 *
 * Industry-standard practices:
 * - Uses singleton pattern to avoid redundant connections.
 * - Reads configuration from environment variables.
 * - Handles fatal errors with process exit.
 */
import { Logger } from "@nestjs/common";
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

/**
 * Connects to MongoDB using Mongoose.
 *
 * @returns {Promise<void>} Resolves when connected.
 */
export default async function dbConnect() {
  const logger = new Logger("DbConnect")
  if (connection.isConnected) {
    logger.log("Already connected to database!");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!);

    connection.isConnected = db.connections[0].readyState;

    logger.log("Database connected!");
  } catch (e) {
    logger.error("Something went wrrong while connecting to db!");
    logger.error(e);

    process.exit();
  }
}