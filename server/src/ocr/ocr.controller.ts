/**
 * OCR Controller
 *
 * Responsibilities:
 * - Listens for Kafka messages on the 'ocr.init' topic.
 * - Delegates OCR processing to the OcrService.
 * - Logs controller activity for monitoring and debugging.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Applies message pattern decorators for microservice event handling.
 */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { kafkaService } from 'src/lib/kafka';
import type { ClassificationObject, OcrObject } from 'src/types';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {

    private readonly logger = new Logger(OcrController.name)
    constructor(private readonly ocrService:OcrService){}

    /**
     * Handles OCR events from Kafka.
     *
     * @param {OcrObject} paylod - The OCR event payload.
     * @returns {Promise<void>} Resolves when OCR processing is complete.
     */
    @MessagePattern('ocr.init')
    async handle(@Payload() paylod: OcrObject) {

        // // if(paylod.attachments.length <= 0) {
        // //     const data : ClassificationObject = {
        // //         metadata : {

        // //         }
        // //     }
        // // } 
        // this.logger.log("OCR DONE")
        // const data = {
        //     metadata: {
        //         subject: "string",
        //         sender: "string",
        //         body: "string",
        //         timestamp: new Date(),
        //         submission_id: "string",
        //     },
        //     parsed_data: "working!"
        // }
        // console.log('-------------------------')
        // await kafkaService.publishMessage('classification.init', data)
        this.logger.log("OCR ENGINE STARTED")
        this.ocrService.processOcr(paylod)
    }
}
