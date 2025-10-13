/**
 * Classification Service
 *
 * Responsibilities:
 * - Processes document classification using AI models.
 * - Updates attachment metadata with classification results.
 * - Publishes classification completion events to Kafka and Redis.
 * - Handles errors and logs processing status.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service and model management.
 * - Implements error handling for AI and database operations.
 * - Publishes events for decoupled microservice communication.
 */
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { kafkaService } from 'src/lib/kafka';
import { redis } from 'src/lib/redis';
import { AnalysisObject, ClassificationObject, Event } from 'src/types';
import { GoogleGenAI } from "@google/genai";
import { generateContent } from 'src/helpers/genAi'

@Injectable()
export class ClassificationService {
    private readonly logger = new Logger(ClassificationService.name);
    private readonly genAI = new GoogleGenAI({});

    /**
     * Processes classification for a submission's attachments.
     *
     * @param {ClassificationObject} message - The classification event payload.
     * @returns {Promise<void>} Resolves when classification workflow is complete.
     */
    async processClassification(message: ClassificationObject): Promise<void> {
        try {
            const results = await Promise.all(
                message.metadata.attachments.map(async (file) => {
                    const classified = await this.classify(file.text || "");
                    file.classification = classified.type;
                    file.confidence = classified.confidence;
                    return {
                        ...file,
                        classified,
                    };
                })
            );

            // const payload: AnalysisObject = {
            //     metadata: message.metadata,
            //     classification: results,
            // };

            const event: Event = {
                id: message.metadata.id,
                message: "classification_completed",
                data: message,
            };

            await redis.set(`redis:status:${event.id}`, JSON.stringify(event));
            await kafkaService.publishMessage('event.pipeline', event);

            this.logger.log(
                `Classification completed for submission ID: ${message.metadata.submission_id}`,
            );
        } catch (error: any) {
            this.logger.error(`Classification Service failed: ${error.message}`);
            throw new InternalServerErrorException('Classification processing failed');
        }
    }

    /**
     * Classifies document text using AI and returns type and confidence.
     *
     * @param {string} text - The document text to classify.
     * @returns {Promise<{ type: string; confidence: number }>} Classification result.
     */
    private async classify(text: string): Promise<{ type: string; confidence: number }> {
        try {
    //         const response = await this.genAI.models.generateContent({
    //             model: "gemini-2.5-flash",
    //             contents: `
    //     You are a document classifier.
    //     Categories: ["invoice", "receipt", "contract", "id_card", "resume"].
    //     Respond ONLY with a JSON object { "type": "...", "confidence": 0-1 }.

    //     Document:
    //     ${text}
    //   `,
    //         });
            const prompt = `
        You are a document classifier.
        Categories: ["invoice", "receipt", "contract", "id_card", "resume"].
        Respond ONLY with a JSON object { "type": "...", "confidence": 0-1 }.

        Document:
        ${text}
      `
            const response = await generateContent(prompt);

            let output = response.text || "unknown";


            output = output.trim();
            if (output.startsWith("```")) {
                output = output.replace(/```[a-z]*\n?/gi, "").replace(/```$/, "").trim();
            }

            // console.log(output)
            const parsed = JSON.parse(output);
            // console.log(parsed)
            return parsed;
        } catch (err: any) {
            this.logger.error(`Gemini classification failed: ${err.message}`);
            return { type: "unknown", confidence: 0 };
        }
    }
}
