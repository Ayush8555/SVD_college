import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to .env if needed (assuming script is in backend/src)
dotenv.config({ path: path.join(__dirname, '../.env') }); 

const fixIndex = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        const db = mongoose.connection.db;
        const collection = db.collection('studentfees');
        
        console.log('Checking indexes on studentfees...');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes.map(i => i.name));
        
        const targetIndex = 'transactions.receiptNumber_1';
        if (indexes.find(i => i.name === targetIndex)) {
            await collection.dropIndex(targetIndex);
            console.log(`Successfully dropped index: ${targetIndex}`);
            console.log('It will be recreated automatically by Mongoose with sparse: true on restart.');
        } else {
            console.log(`Index ${targetIndex} not found.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndex();
