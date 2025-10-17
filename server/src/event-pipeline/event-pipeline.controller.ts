import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Event } from 'src/types';
import { EventPipelineService } from './event-pipeline.service';

/**
 * EventPipelineController handles incoming event messages through a message broker.
 * This controller:
 * - Listens for events on the 'event.pipeline' topic
 * - Processes incoming events through the EventPipelineService
 * - Acts as a message-driven endpoint for event processing in the application
 */

@Controller('event-pipeline')
export class EventPipelineController {
    constructor(private readonly eventPipelineService : EventPipelineService){}
    @MessagePattern('event.pipeline')
    async update(@Payload() event : Event){
        this.eventPipelineService.update(event);
    }
}
