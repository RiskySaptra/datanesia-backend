import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (
      configService: ConfigService,
    ): Promise<typeof mongoose> => {
      const uri = configService.get<string>('MONGODB_URI');
      const dbName = configService.get<string>('DB_NAME') || 'testing'; // Default to 'testing' if not set

      try {
        return await mongoose.connect(uri, { dbName });
      } catch (error) {
        console.error('Error connecting to MongoDB:', error.message); // Log connection error
        throw new Error('Could not connect to the database'); // Rethrow for higher-level handling
      }
    },
    inject: [ConfigService],
  },
];
