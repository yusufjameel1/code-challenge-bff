import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import setupUtils from './utils/setup.utils';
import Logger from './utils/logger.utils';

// Load environment variables
dotenv.config();

const logger = Logger.getInstance();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-challenge-bff';

const connectDB = async () => {
    try {
        // Close existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Create new connection
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Initialize data after successful connection
        await setupUtils.initializeData();
        logger.info('Data initialization completed');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Initialize server variable in wider scope
let server: ReturnType<typeof app.listen>;

// Start server function
const startServer = async () => {
    try {
        // Connect to MongoDB and initialize data
        await connectDB();

        const PORT = process.env.PORT || 3000;
        server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        return server;
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await mongoose.disconnect();
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    }
});

// Start the server
startServer();

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await mongoose.disconnect();
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});