import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Graph, GraphFilter } from './graph.interface';

@Injectable()
export class GraphService {
  constructor(
    @Inject('GRAPH_MODEL') private readonly graphModel: Model<Graph>,
  ) {}

  private calculateAvailability(availDur: number): number {
    const totalTime = 900; // Total time period (900 seconds = 15 minutes)
    const availability = (availDur / totalTime) * 100;
    return Math.round(availability); // Round to nearest whole number
  }

  // Method to retrieve all graphs
  async getAllGraphs(): Promise<Graph[]> {
    return this.graphModel.find().exec(); // Retrieve all documents
  }

  // Method to retrieve all graphs filter for cellId and enodebId
  async getAllGraphFilter(): Promise<GraphFilter> {
    const result = await this.graphModel
      .aggregate([
        {
          $group: {
            _id: '$cellId', // Group by cellId
            enodebIds: { $push: '$enodebId' }, // Collect enodebIds in an array
          },
        },
        {
          $project: {
            _id: 0,
            cellId: '$_id', // Rename _id to cellId
            enodebIds: 1,
          },
        },
      ])
      .exec();

    // Return the transformed result
    return result.reduce((acc, { cellId, enodebIds }) => {
      acc[cellId] = enodebIds; // Directly assign enodebIds to the cellId key
      return acc;
    }, {} as GraphFilter);
  }

  // Method to retrieve graphs by date range
  async getGraphsByDateRange(
    startDate: Date,
    endDate: Date,
    cellId?: string,
    enodebId?: string,
  ): Promise<
    { cellId: string; resultTime: Array<{ x: number; y: number }> }[]
  > {
    const query: any = {
      resultTime: {
        $gte: startDate, // Greater than or equal to startDate
        $lte: endDate, // Less than or equal to endDate
      },
    };

    // Add cellId filter if provided
    if (cellId) {
      query.cellId = cellId;
    }

    // Add enodebId filter if provided
    if (enodebId) {
      query.enodebId = enodebId;
    }

    // Fetch the graphs based on the query
    const graphs = await this.graphModel
      .find(query)
      .sort({ resultTime: 1 })
      .exec();

    // Transform the results into the desired format
    const groupedData = graphs.reduce(
      (acc, graph) => {
        const timePoint = {
          x: new Date(graph.resultTime).getTime(),
          y: this.calculateAvailability(graph.availDur),
        };

        // Find the existing entry for this cellId
        const existingCell = acc.find((item) => item.cellId === graph.cellId);

        if (existingCell) {
          // If it exists, push the new timePoint into its resultTime array
          existingCell.resultTime.push(timePoint);
        } else {
          // If it doesn't exist, create a new entry
          acc.push({
            cellId: graph.cellId,
            resultTime: [timePoint], // Start with the current timePoint
          });
        }

        return acc;
      },
      [] as { cellId: string; resultTime: Array<{ x: number; y: number }> }[],
    );

    return groupedData;
  }

  async clearGraphs(): Promise<void> {
    await this.graphModel.deleteMany({}); // Clear all documents in the Graph collection
  }
}
