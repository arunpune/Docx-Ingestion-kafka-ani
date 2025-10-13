export interface Attachment {
    filename?: string;
    content_type: string;
    url: string;
    text?:string;
    classification?:string;
    confidence?:number;
}

export interface BaseObject {
    submission_id: string;
}

export interface IngestionObject {
    metadata: {
        subject: string;
        sender: string;
        body: string;
        timestamp: Date;
        id: string;
        attachments: Attachment[];
        submission_id: string
    }

}

export interface OcrObject {
    metadata: {
        subject: string;
        sender: string;
        body: string;
        timestamp: Date;
        id: string;
        attachments: Attachment[];
        submission_id: string
    }
}

export interface ClassificationObject {
    metadata: {
        subject: string;
        sender: string;
        body: string;
        timestamp: Date;
        id: string;
        attachments: Attachment[];
        submission_id: string
    }
}

export interface AnalysisObject {
    metadata: {
        subject: string;
        sender: string;
        body: string;
        timestamp: Date;
        id: string;
        attachments: Attachment[];
        submission_id: string
    }
}

export interface Event {
    id: string;
    message: string;
    data: OcrObject | IngestionObject | ClassificationObject | AnalysisObject
}