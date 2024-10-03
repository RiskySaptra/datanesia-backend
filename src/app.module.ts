import { GraphModule } from '@modules/graph/graph.module';
import { UploadModule } from '@modules/upload/upload.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GraphModule, UploadModule],
})
export class AppModule {}
