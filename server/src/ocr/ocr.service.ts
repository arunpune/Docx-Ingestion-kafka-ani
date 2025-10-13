/**
 * OCR Service
 *
 * Responsibilities:
 * - Processes attachments for OCR extraction.
 * - Handles image and PDF text extraction using Tesseract and pdf-parse.
 * - Publishes OCR completion events to Kafka and Redis.
 * - Logs processing status and errors for observability.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Implements error handling and timeouts for OCR operations.
 * - Publishes events for decoupled microservice communication.
 */

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import { kafkaService } from 'src/lib/kafka';
import { redis } from 'src/lib/redis';
import type { Event, OcrObject } from 'src/types';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Processes OCR for a given submission's attachments.
   *
   * @param {OcrObject} message - The OCR event payload containing attachments.
   * @returns {Promise<void>} Resolves when OCR workflow is complete.
   */
  async processOcr(message: OcrObject): Promise<void> {
    const submissionId = message.metadata.submission_id;
    try {
      const results = await Promise.all(
        message.metadata.attachments.map(async (att) => {
          try {
            let text = '';
            
            if (att.content_type.includes('image')) {
              text = await this.extractTextFromImage(att.url);
              att.text = text;
            } else if (att.content_type.includes('pdf')) {
              text = await this.extractTextFromPdf(att.url);
              att.text = text;
            } else {
              this.logger.warn(`[${submissionId}] Unsupported file type: ${att.content_type} (${att.filename})`);
              att.text = "";
              return null;
            }

            this.logger.log(`[${submissionId}] OCR extracted text for file: ${att.filename}`);
            return { ...att, text };
          } catch (err: any) {
            this.logger.error(`[${submissionId}] Failed to process ${att.filename}: ${err.message}`);
            return { ...att, text: '' }; // keep empty text for failed attachments
          }
        }),
      );

      const parsedData = results.filter(r => r !== null);

      // const payload = {
      //   metadata: message.metadata,
      //   parsed_data: parsedData,
      // };

      const event: Event = {
        id: message.metadata.id,
        message: 'ocr_completed',
        data: message,
      };

      await redis.set(`ocr:status:${event.id}`, JSON.stringify(event), 'EX', 3600); // 1 hour expiry
      await kafkaService.publishMessage('event.pipeline', event);
      await kafkaService.publishMessage('classification.init', message);

      this.logger.log(`[${submissionId}] OCR processing completed for submission.`);
    } catch (error: any) {
      this.logger.error(`[${submissionId}] OCR Service failed: ${error.message}`);
      throw new InternalServerErrorException('OCR processing failed');
    }
  }

  /**
   * Extracts text from an image URL using Tesseract OCR.
   * Applies a timeout to prevent long-running operations.
   *
   * @param {string} imageUrl - The URL of the image to process.
   * @returns {Promise<string>} Extracted text from the image.
   */
  private async extractTextFromImage(imageUrl: string): Promise<string> {
    const submissionTimeout = 60_000; // 60 seconds timeout
    return Promise.race([
      this._extractTextFromImage(imageUrl),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('OCR Timeout')), submissionTimeout),
      ),
    ]);
  }

  /**
   * Internal helper for image OCR extraction.
   *
   * @param {string} imageUrl - The URL of the image to process.
   * @returns {Promise<string>} Extracted text from the image.
   */
  private async _extractTextFromImage(imageUrl: string): Promise<string> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text.trim();
  }

  /**
   * Extracts text from a PDF file using pdf-parse.
   *
   * @param {string} pdfUrl - The URL of the PDF to process.
   * @returns {Promise<string>} Extracted text from the PDF.
   */
  private async extractTextFromPdf(pdfUrl: string): Promise<string> {
    // console.log("extracting");
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    // console.log("LAlA : ", response);
    const buffer = Buffer.from(response.data);
    // console.log("uMhM :", buffer)
    const pdfData = await pdfParse(buffer);
    // console.log("pdf : ",pdfData);
    return pdfData.text.trim();
  }
}
