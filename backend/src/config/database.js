import mongoose from 'mongoose';

/**
 * MongoDB Database Connection
 * Connects to MongoDB Atlas or local MongoDB instance
 */
const connectDatabase = async (retries = 5) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 50,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database Name: ${conn.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB connection error: ${err}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      });

      return conn;
    } catch (error) {
      console.error(`❌ Error connecting to MongoDB: ${error.message}`);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        console.error('🔥 Could not connect to DB after multiple attempts. Exiting...');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
  }
};
export default connectDatabase;
