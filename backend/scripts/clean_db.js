import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanDatabase = async () => {
    try {
        console.log('Connecting to DB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to: ${conn.connection.db.databaseName}`);

        const collections = await conn.connection.db.listCollections().toArray();
        const existingNames = collections.map(c => c.name);

        console.log('Current Collections:', existingNames);

        // Collections to KEEP (Active Models)
        const keepList = ['admins', 'students', 'results', 'courses', 'queries', 'collegesettings'];

        // Identify Drop Targets
        const toDrop = existingNames.filter(name => !keepList.includes(name));

        if (toDrop.length === 0) {
            console.log('✅ Database is already clean. No unused collections found.');
        } else {
            console.log(`\n🗑️  Found ${toDrop.length} unused collection(s): ${toDrop.join(', ')}`);
            
            for (const collectionName of toDrop) {
                console.log(`Dropping collection: ${collectionName}...`);
                await conn.connection.db.dropCollection(collectionName);
                console.log(`✅ Dropped ${collectionName}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
};

cleanDatabase();
