import { Injectable } from '@nestjs/common';
import attachment from '../models/attachment';
import submission from '../models/submission';
import type { Event } from '../types';


/**
 * EventPipelineService handles the event-driven updates for submissions and their attachments.
 * This service is responsible for:
 * - Updating submission status based on incoming events
 * - Managing attachment metadata for submissions
 * - Maintaining consistency between submission and attachment documents in the database
 * 
 * It processes events that contain submission metadata and attachment information,
 * ensuring that both the submission status and related attachment data are updated atomically.
 */

@Injectable()
export class EventPipelineService {

    async update(event: Event) {
        // Update submission status
        await submission.updateOne(
            { id: event.data.metadata.submission_id },
            { $set: { status: event.message } },
        );

        // Fetch the submission to get the attachments ObjectId
        const subDoc = await submission.findOne({ id: event.data.metadata.submission_id });

        if (!subDoc || !subDoc.attachments) return;

        // Update the attachments document
        await attachment.updateOne(
            { _id: subDoc.attachments },
            { $set: { attachments: event.data.metadata.attachments } }
        );
    }
}
