/**
 * Classification Controller
 *
 * Responsibilities:
 * - Listens for Kafka messages on the 'classification.init' topic.
 * - Delegates classification processing to the ClassificationService.
 * - Logs controller activity for monitoring and debugging.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Applies message pattern decorators for microservice event handling.
 */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ClassificationObject } from 'src/types';
import { ClassificationService } from './classification.service';

@Controller('classification')
export class ClassificationController {
    private readonly logger = new Logger(ClassificationController.name)
    constructor(private readonly classificationService: ClassificationService){}

    /**
     * Handles classification events from Kafka.
     *
     * @param {ClassificationObject} payload - The classification event payload.
     * @returns {Promise<void>} Resolves when classification processing is complete.
     */
    @MessagePattern('classification.init')
    async handle(@Payload() payload: ClassificationObject) {
        // this.logger.log("Started Classification ");
        // console.log("YOU ARE ALL SET")
        // this.logger.log("NICE WORK");
        this.logger.log("CLASSIFICATION ENGINE STARTED")
        this.classificationService.processClassification(payload)
    }
}
