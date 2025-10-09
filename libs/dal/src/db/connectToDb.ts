import mongoose from 'mongoose';

let client: typeof mongoose;

export const connectToDb = async () => {
  try {
    if (!client) {
      console.log('==> creating db client');
      const auth = `${process.env.DB_USERNAME}:${encodeURIComponent(
        process.env.DB_PASSWORD ?? ''
      )}`;

      client = await mongoose.connect(
        `mongodb+srv://${auth}@swivel-portal-cluster.dug9ase.mongodb.net/?retryWrites=true&w=majority&appName=swivel-portal-cluster`
      );
      console.log('==> db client created');
    } else {
      console.log('==> reusing db client');
    }
  } catch (error) {
    console.log('Failed to connect to the database', error);
  }
};
