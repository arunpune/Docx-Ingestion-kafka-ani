import { Injectable } from '@nestjs/common';
import attachment from '../models/attachment';
import submission from '../models/submission';
import type { Event } from '../types';

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
