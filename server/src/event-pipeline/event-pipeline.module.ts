import { Module } from '@nestjs/common';
import { EventPipelineController } from './event-pipeline.controller';
import { EventPipelineService } from './event-pipeline.service';

@Module({
  controllers: [EventPipelineController],
  providers: [EventPipelineService]
})
export class EventPipelineModule {}
