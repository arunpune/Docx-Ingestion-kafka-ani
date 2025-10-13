/**
 * Proxy Service
 *
 * Responsibilities:
 * - Retrieves all submissions from the database.
 * - Populates each submission with its associated attachments.
 * - Handles errors and logs processing status.
 *
 * Industry-standard practices:
 * - Uses dependency injection for model management.
 * - Implements error handling for database operations.
 * - Logs errors for observability and debugging.
 */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import attachment from '../models/attachment';
import submission from '../models/submission';

@Injectable()
export class ProxyService {
    private readonly logger = new Logger(ProxyService.name);

    /**
     * Fetches all submissions with populated attachments.
     *
     * @returns {Promise<any>} Array of submission documents with attachments.
     * @throws {InternalServerErrorException} If a database error occurs.
     */
    async handle() {
        try {
            const submissions = await submission.find()
                .populate("attachments");

            return submissions;
        } catch (err) {
            this.logger.error(err);
            throw new InternalServerErrorException('Server error');
        }
    }
}
