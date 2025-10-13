/**
 * MongoDB Singleton Utility
 *
 * Responsibilities:
 * - Manages a single MongoDB connection instance.
 * - Provides model creation and retrieval for database operations.
 *
 * Industry-standard practices:
 * - Implements singleton pattern for efficient resource management.
 * - Uses environment variables for connection configuration.
 * - Supports dynamic model creation for flexible schema management.
 */
import mongoose, { Connection, Model } from "mongoose"

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/testdb"

class MongoSingleton {
  private static connection: Connection

  /**
   * Returns a connected MongoDB instance.
   *
   * @returns {Promise<Connection>} MongoDB connection.
   */
  static async getInstance(): Promise<Connection> {
    if (!this.connection) {
      await mongoose.connect(MONGO_URI)
      this.connection = mongoose.connection
    }
    return this.connection
  }

  /**
   * Returns a Mongoose model for the specified schema.
   *
   * @param {string} name - Model name.
   * @param {mongoose.Schema<T>} schema - Mongoose schema.
   * @returns {Promise<Model<T>>} Mongoose model.
   */
  static async getModel<T>(name: string, schema: mongoose.Schema<T>): Promise<Model<T>> {
    await this.getInstance()
    return mongoose.models[name] || mongoose.model<T>(name, schema)
  }
}

export { MongoSingleton }
