import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.error("===== FULL ERROR =====");
    console.error(error);
    console.error("======================");
    process.exit(1);
  }
};

export default connectDB;

