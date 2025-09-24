import mongoHelper from './helpers/mongoose-test-helper';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    await mongoHelper.connect();
});

afterAll(async () => {
    await mongoHelper.closeDatabase();
});

beforeEach(async () => {
    await mongoHelper.clearDatabase();
});