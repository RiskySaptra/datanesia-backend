import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Graph } from './graph.interface';

@Injectable()
export class GraphService {
  constructor(
    @Inject('GRAPH_MODEL') private readonly graphModel: Model<Graph>,
  ) {}

  // Method to retrieve all graphs
  async getAllGraphs(): Promise<Graph[]> {
    return this.graphModel.find().exec(); // Retrieve all documents
  }

  // Method to retrieve graphs by date range
  async getGraphsByDateRange(startDate: Date, endDate: Date): Promise<Graph[]> {
    return this.graphModel
      .find({
        resultTime: {
          $gte: startDate, // Greater than or equal to startDate
          $lte: endDate, // Less than or equal to endDate
        },
      })
      .sort({ resultTime: 1 })
      .exec();
  }

  async clearGraphs(): Promise<void> {
    await this.graphModel.deleteMany({}); // Clear all documents in the Graph collection
  }
}
