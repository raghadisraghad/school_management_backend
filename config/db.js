import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();
// dotenv.config({ path: '../.env' });

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export const s3 = new S3Client({
  endpoint: `https://s3.${process.env.WASABI_REGION}.wasabisys.com`,
  region: process.env.WASABI_REGION,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
  },
  forcePathStyle: true,
});
