/**
 * Ingestion Service
 *
 * Responsibilities:
 * - Handles the ingestion workflow for new submissions.
 * - Persists submission and attachment data to the database.
 * - Publishes ingestion completion events to Kafka and Redis.
 * - Prepares payloads for downstream OCR processing.
 * - Logs key actions and errors for observability.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service and model management.
 * - Implements error handling for database operations.
 * - Publishes events for decoupled microservice communication.
 */
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import dbConnect from 'src/helpers/db';
import { kafkaService } from 'src/lib/kafka';
import { redis } from 'src/lib/redis';
import attachment from 'src/models/attachment';
import submission from 'src/models/submission';
import { Event, IngestionObject, OcrObject } from 'src/types';

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);

    /**
     * Processes an ingestion event and persists relevant data.
     *
     * @param {IngestionObject} message - The ingestion event payload.
     * @returns {Promise<void>} Resolves when ingestion workflow is complete.
     */
    async ingestion(message: IngestionObject): Promise<void> {
        // await dbConnect();
        const sub = await submission.create({
            subject: message.metadata.subject,
            sender: message.metadata.sender,
            body: message.metadata.body,
            id: message.metadata.id,
            status: "ingestion in progress"
        });

        if (!sub) {
            throw new InternalServerErrorException('Submission population failed');
        }

        if (message.metadata.attachments?.length) {

            const attch = await attachment.create({
                attachments: message.metadata.attachments,
            });
            await submission.updateOne(
                { id: sub.id },
                { $set: { attachments: attch._id, status: "ingestion done" } },
            );
        }

        const payload: OcrObject = {
            metadata: {
                subject: message.metadata.subject,
                sender: message.metadata.sender,
                body: message.metadata.body,
                timestamp: new Date(),
                id: message.metadata.id,
                submission_id: sub.id,
                attachments: (message.metadata.attachments || []).map(att => ({
                    filename: att.filename ?? '',
                    content_type: att.content_type,
                    url: att.url
                }))
            },

        }

        const event: Event = {
            id: message.metadata.id,
            message: "ingestion_completed",
            data: payload
        }

        await redis.set(`redis:status:${event.id}`, JSON.stringify(event))
        await kafkaService.publishMessage('event.pipeline', event)
        await kafkaService.publishMessage('ocr.init', payload)

        this.logger.log(`Ingestion completed for submission ID: ${sub.id}`);
    }
}
