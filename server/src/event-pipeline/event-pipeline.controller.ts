import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Event } from 'src/types';
import { EventPipelineService } from './event-pipeline.service';

@Controller('event-pipeline')
export class EventPipelineController {
    constructor(private readonly eventPipelineService : EventPipelineService){}
    @MessagePattern('event.pipeline')
    async update(@Payload() event : Event){
        this.eventPipelineService.update(event);
    }
}
