import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  mongooseConn: typeof mongoose | null;
  mongoosePromise: Promise<typeof mongoose> | null;
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (globalForMongoose.mongooseConn) return globalForMongoose.mongooseConn;

  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(uri);
  }

  globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  return globalForMongoose.mongooseConn;
}
