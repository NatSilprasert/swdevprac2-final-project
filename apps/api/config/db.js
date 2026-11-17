const mongoose = require("mongoose");
const dns = require("node:dns");

// Use public DNS resolvers for MongoDB Atlas SRV lookups.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

let pending = null;

// The connection is cached so serverless invocations reuse it instead of reconnecting.
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!pending) {
    mongoose.set("strictQuery", true);
    pending = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
};

module.exports = connectDB;
