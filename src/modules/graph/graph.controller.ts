import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { GraphService } from './graph.service';
import { Graph, GraphFilter } from './graph.interface';

@Controller('api/v1/graphs')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

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

  private createSuccessResponse<T>(data: T[], status: string = 'success') {
    return {
      status,
      data,
    };
  }

  // Endpoint to get all graphs
  @Get()
  async getAllGraphs(): Promise<{
    status: string;
    data: Graph[];
  }> {
    const graphs = await this.graphService.getAllGraphs();
    return this.createSuccessResponse(graphs);
  }

  // Endpoint to get filtered graphs
  @Get('filter')
  async getAllGraphFilter(): Promise<{
    status: string;
    data: GraphFilter[];
  }> {
    const graphs = await this.graphService.getAllGraphFilter();
    return this.createSuccessResponse([graphs]);
  }

  // Endpoint to get graphs by date range
  @Get('date-range')
  async getGraphsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('cellId') cellId?: string, // Optional query parameter
    @Query('enodebId') enodebId?: string, // Optional query parameter
  ): Promise<{
    status: string;
    data: any;
  }> {
    const [start, end] = this.validateAndParseDateRange(startDate, endDate);
    const graphs = await this.graphService.getGraphsByDateRange(
      start,
      end,
      cellId,
      enodebId,
    );

    return this.createSuccessResponse(graphs);
  }

  // Endpoint to clear all graphs
  @Delete() // Clear all graphs at the base endpoint
  async clearCollection(): Promise<{
    status: string;
    message: string;
  }> {
    await this.graphService.clearGraphs();
    return {
      status: 'success',
      message: 'All graph records have been cleared.',
    };
  }
}
