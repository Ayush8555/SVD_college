import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to .env file (going up one level from scripts/ to backend/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const inspect = async () => {
    try {
        console.log('Connecting to URI:', process.env.MONGODB_URI);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to: ${conn.connection.db.databaseName}`);

        const collections = await conn.connection.db.listCollections().toArray();
        console.log('\nExisting Collections:');
        collections.forEach(c => console.log(` - ${c.name}`));

        // Identify potentially unused ones based on standard models
        const knownCollections = ['admins', 'users', 'students', 'results', 'courses', 'queries', 'collegesettings'];
        
        const unused = collections.filter(c => !knownCollections.includes(c.name));
        
        if (unused.length > 0) {
            console.log('\nPotential UNUSED Collections (Candidates for Deletion):');
            unused.forEach(u => console.log(` - ${u.name}`));
        } else {
            console.log('\nNo obvious unused collections found based on standard model names.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
