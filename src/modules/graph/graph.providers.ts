import { Connection } from 'mongoose';
import { GraphSchema } from './graph.schema';

export const graphProviders = [
  {
    provide: 'GRAPH_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('raw_data', GraphSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
