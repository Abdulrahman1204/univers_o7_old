import mongoose from "mongoose";
import colors from "colors";

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URL);

    console.log(colors.yellow.underline("Connected To MongoDB ^_^"));
  } catch (error) {
    console.error(colors.red.bold("Connection Failed To MongoDB! ): "), error);
    process.exit(1); 
  }
};

export default connectDB;
