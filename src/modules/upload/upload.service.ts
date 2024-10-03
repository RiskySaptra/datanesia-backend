import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Graph } from '../graph/graph.interface';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(
    @Inject('GRAPH_MODEL') private readonly graphModel: Model<Graph>,
  ) {}

  async uploadCsv(fileBuffer: Buffer) {
    try {
      const csvData = await this.parseCsv(fileBuffer);
      const parsedData = this.parseCsvData(csvData);

      const bulkOps = parsedData.map((doc) => ({
        updateOne: {
          filter: {
            enodebId: doc.enodebId,
            cellId: doc.cellId,
          },
          update: { $setOnInsert: doc }, // Insert if not exists
          upsert: true,
        },
      }));

      // Perform bulk operation to insert or update documents
      const result = await this.graphModel.bulkWrite(bulkOps, {
        ordered: false,
      });

      return {
        message: 'File uploaded and processed successfully',
        insertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error('Error processing CSV file:', error.message);
      throw new HttpException(
        'Error processing CSV file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseCsvData(csvData: any[]): any[] {
    return csvData.reduce((acc, data) => {
      if (data['Result Time'] && data['L.Cell.Avail.Dur']) {
        const enodebId =
          (data['Object Name'].match(/eNodeB ID=(\d+)/) || [])[1] || '';
        const cellId =
          (data['Object Name'].match(/Local Cell ID=(\d+)/) || [])[1] || '';
        acc.push({
          _id: `${enodebId}-${cellId}-${data['Result Time'].split(' ')[0]}`,
          resultTime: new Date(data['Result Time']),
          enodebId: enodebId,
          cellId: cellId,
          availDur: Number(data['L.Cell.Avail.Dur']),
        });
      }
      return acc;
    }, []);
  }

  private parseCsv(buffer: Buffer): Promise<any[]> {
    const results: any[] = [];
    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', (error) => {
          console.error('Error parsing CSV data:', error.message);
          reject(error);
        });
    });
  }
}
