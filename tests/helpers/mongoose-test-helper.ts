import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class MongooseTestHelper {
    private mongoServer: MongoMemoryServer | null = null;

    async connect(): Promise<void> {
        try {
            this.mongoServer = await MongoMemoryServer.create();
            const uri = this.mongoServer.getUri();

            // Close existing connections if any
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }

            // Connect to the in-memory database
            await mongoose.connect(uri);
        } catch (error) {
            console.error('Error connecting to in-memory MongoDB:', error);
            throw error;
        }
    }

    async clearDatabase(): Promise<void> {
        try {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                const collection = collections[key];
                await collection.deleteMany({});
            }
        } catch (error) {
            console.error('Error clearing database:', error);
            throw error;
        }
    }

    async closeDatabase(): Promise<void> {
        try {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            if (this.mongoServer) {
                await this.mongoServer.stop();
            }
        } catch (error) {
            console.error('Error closing database:', error);
            throw error;
        }
    }
}

export default new MongooseTestHelper();