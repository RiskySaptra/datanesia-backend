import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { graphProviders } from './graph.providers';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GraphController],
  providers: [GraphService, ...graphProviders],
  exports: [...graphProviders],
})
export class GraphModule {}
