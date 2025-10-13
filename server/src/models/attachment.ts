import mongoose, { Document, Schema } from "mongoose";

export interface Attachment extends Document {
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

const attachmentSchema = new Schema<Attachment>(
    {
        attachments: {
            type: [
                {
                    filename: { type: String, required: true },
                    content_type: { type: String, required: true },
                    url: { type: String, required: true },
                    text: { type: String, default: null },
                    classification: { type: String, default: null },
                    confidence: { type: Number, default: null },

                }
            ],
            default: []
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Attachment || mongoose.model<Attachment>("Attachment", attachmentSchema);
