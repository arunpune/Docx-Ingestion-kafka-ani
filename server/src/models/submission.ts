import mongoose, { Document, Schema } from "mongoose";

export interface Submission extends Document {
    sender: string;
    body: string;
    timestamp: Date;
    id: string;
    attachments: mongoose.Types.ObjectId;
    status: string
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema = new Schema<Submission>(
    {
 
        sender: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        id: {
            type: String,
            required: true
        },
        attachments:
        {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "Attachment"
        },
        status:{
            type: String,
            required: true
        }

    },
    {
        timestamps: true
    }
);

export default mongoose.models.Submission || mongoose.model<Submission>("Submission", submissionSchema);
