import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GraphService } from './graph.service';
import { Graph } from './graph.interface';
@Controller('api/v1/graphs')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  private formatGraphData(graphs: Graph[]): Array<{ x: number; y: number }> {
    return graphs.map((graph) => ({
      x: new Date(graph.resultTime).getTime(),
      y: graph.availDur,
    }));
  }

  private validateAndParseDateRange(
    startDate: string,
    endDate: string,
  ): [Date, Date] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
    }

    if (start > end) {
      throw new HttpException(
        'Start date must be before end date',
        HttpStatus.BAD_REQUEST,
      );
    }

    return [start, end];
  }

  private createSuccessResponse(data: any[], status: string = 'success') {
    return {
      status,
      total: data.length,
      data,
    };
  }

  // Endpoint to get all graphs
  @Get()
  async getAllGraphs(): Promise<{
    status: string;
    total: number;
    data: Graph[];
  }> {
    const graphs = await this.graphService.getAllGraphs();
    return this.createSuccessResponse(graphs);
  }

  // Endpoint to get graphs by date range
  @Get('date-range')
  async getGraphsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{
    status: string;
    total: number;
    data: Array<{ x: Date; y: number }>;
  }> {
    const [start, end] = this.validateAndParseDateRange(startDate, endDate);
    const graphs = await this.graphService.getGraphsByDateRange(start, end);
    const formattedData = this.formatGraphData(graphs);
    return this.createSuccessResponse(formattedData);
  }
}
