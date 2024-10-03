import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller'; // Update path as necessary
import { GraphModule } from '@modules/graph/graph.module';
import { UploadService } from './upload.service';
import { DatabaseModule } from '@modules/database/database.module';

@Module({
  imports: [DatabaseModule, GraphModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
