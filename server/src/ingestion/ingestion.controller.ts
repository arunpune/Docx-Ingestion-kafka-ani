/**
 * Ingestion Controller
 *
 * Responsibilities:
 * - Listens for Kafka messages on the 'submission.found' topic.
 * - Delegates ingestion processing to the IngestionService.
 * - Logs controller activity for monitoring and debugging.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Applies message pattern decorators for microservice event handling.
 */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { kafkaService } from 'src/lib/kafka';
import type { IngestionObject, OcrObject } from 'src/types';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
    private readonly logger = new Logger(IngestionController.name)
    constructor(private readonly ingestionService: IngestionService){}

    /**
     * Handles ingestion events from Kafka.
     *
     * @param {IngestionObject} payLoad - The ingestion event payload.
     * @returns {Promise<void>} Resolves when ingestion is complete.
     */
    @MessagePattern('submission.found')
    async ingestion(@Payload() payLoad: IngestionObject) {
        this.logger.log("Ingestion Controller Working")
        await this.ingestionService.ingestion(payLoad);
    }
}
