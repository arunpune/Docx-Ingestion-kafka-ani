# **Document Processing System - Complete Guide for Beginners 🚀**

## **Table of Contents**
1. [What This System Does](#what-this-system-does)
2. [Core Concepts Explained](#core-concepts-explained)
3. [Step-by-Step Processing Journey](#step-by-step-processing-journey)
4. [TypeScript Best Practices](#typescript-best-practices-explained)
5. [Detailed Architecture Documentation](#detailed-architecture-documentation)

---

## **What This System Does**

Imagine you receive hundreds of emails with document attachments every day. Reading and organizing them manually would take forever! This system automates that process:

1. **Receives emails** with document attachments (like PDFs, images, Word files)
2. **Extracts text** from images using OCR (Optical Character Recognition - like teaching a computer to read)
3. **Classifies documents** using AI (figures out what type of document it is)
4. **Shows real-time updates** on a dashboard so you can monitor everything

**Real-World Example:** Think of it like an automated mail sorting system at the post office, but for digital documents!

---

## **Core Concepts Explained**

### **1. Microservices Architecture** 🏗️

**What it means:** Instead of one giant program doing everything, we split the work into smaller, independent services.

**Analogy:** Think of a restaurant:
- **Kitchen** (Backend services) - Prepares food
- **Waiters** (API) - Carries food between kitchen and customers
- **Dining area** (Frontend) - Where customers eat

Each team can work independently, and if the kitchen has a problem, the dining area still works!

**Our Services:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Ingestion  │────▶│     OCR     │────▶│Classification│
│  Service    │     │  Service    │     │   Service    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      └────────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    └─────────────┘
```

### **2. Event-Driven Architecture** 📨

**What it means:** Services communicate by sending "events" (messages) to each other, rather than directly calling each other.

**Analogy:** Like a relay race - each runner (service) passes the baton (document data) to the next runner and doesn't need to know what happens after.

**Why it's powerful:**
- Services don't wait for each other
- If one service is slow, others keep running
- Easy to add new services without changing existing ones

**Example Flow:**
```javascript
// 1. Email arrives
IngestionService sends: { type: 'EMAIL_RECEIVED', documentId: '123' }

// 2. OCR service picks it up
OcrService processes and sends: { type: 'TEXT_EXTRACTED', documentId: '123', text: '...' }

// 3. Classification service picks it up
ClassificationService sends: { type: 'CLASSIFIED', documentId: '123', category: 'Invoice' }
```

### **3. Technology Stack** 🛠️

Let's understand each technology and WHY we use it:

#### **Backend: NestJS**
**What it is:** A framework for building server applications with TypeScript  
**Why we use it:** 
- Built-in structure (like LEGO instructions for building apps)
- Great for microservices
- TypeScript support (catch errors before running code)

#### **Frontend: Next.js**
**What it is:** A React framework for building user interfaces  
**Why we use it:**
- Fast page loads
- Server-side rendering (pages load faster)
- Built-in routing (no extra setup needed)

#### **Database: MongoDB**
**What it is:** A NoSQL database that stores data like JSON objects  
**Why we use it:**
- Flexible schema (documents can have different fields)
- Fast for reading/writing large amounts of data
- Perfect for document metadata

**Example Document:**
```javascript
{
  _id: "abc123",
  emailSubject: "Invoice #5678",
  status: "classified",
  attachments: [
    { filename: "invoice.pdf", url: "https://..." }
  ],
  classification: "Invoice",
  createdAt: "2024-01-15T10:30:00Z"
}
```

#### **Message Queue: Kafka**
**What it is:** A system for sending messages between services  
**Why we use it:**
- Handles millions of messages
- Messages are never lost (stored until processed)
- Multiple services can read the same message

**Analogy:** Like a conveyor belt in a factory - items (messages) keep moving, and different workers (services) can pick them up.

#### **Cache: Redis**
**What it is:** Super-fast temporary storage (like RAM for your app)  
**Why we use it:**
- Real-time updates (pub/sub for dashboard)
- Caching (store frequently accessed data)
- 1000x faster than database reads

**Use Cases:**
```javascript
// 1. Caching - Store frequently accessed data
Redis: "document:123" → { status: "processing", progress: 75% }

// 2. Pub/Sub - Real-time updates
RedisPublisher: "document-updates" → { documentId: "123", status: "complete" }
```

#### **File Storage: Cloudinary**
**What it is:** Cloud service for storing and managing files  
**Why we use it:**
- Automatic optimization (compress images)
- CDN delivery (fast loading from anywhere)
- Image transformations (resize, crop)

#### **AI: Google Gemini**
**What it is:** AI model for understanding and classifying text  
**Why we use it:**
- Understands context (not just keywords)
- Can classify 100+ document types
- Handles multiple languages

---

## **Step-by-Step Processing Journey**

### **Scenario: Processing an Invoice Email**

**Email Content:**
```
From: vendor@example.com
Subject: Invoice #12345
Attachment: invoice.pdf (scanned image)
```

### **Step 1: Email Polling (Lambda Service)**

```typescript
// Every 30 seconds, check for new emails
setInterval(async () => {
  // 1. Connect to email server
  const client = await imapConnect({
    host: 'imap.gmail.com',
    port: 993,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // 2. Select inbox
  await client.select('INBOX');
  
  // 3. Search for unread emails with attachments
  const messages = await client.search({
    unseen: true,
    hasAttachment: true
  });
  
  console.log(`Found ${messages.length} new emails`);
  
  // 4. Process each email
  for (const message of messages) {
    await processNewEmail(message);
  }
}, 30_000); // 30 seconds
```

**What happens:**
1. Connects to email server (like Gmail)
2. Looks for unread emails with attachments
3. Processes each email
4. Marks emails as read after processing

### **Step 2: Attachment Processing**

```typescript
async function processNewEmail(message) {
  // 1. Extract attachment from email
  const attachment = message.attachments[0];
  
  console.log(`Processing: ${attachment.filename}`);
  
  // 2. Download attachment to memory
  const fileBuffer = await downloadAttachment(message, attachment);
  
  // 3. Upload to Cloudinary for permanent storage
  const uploadResult = await cloudinary.uploader.upload(fileBuffer, {
    folder: 'document-submissions',
    resource_type: 'auto', // Handles PDFs, images, etc.
    public_id: `${Date.now()}-${attachment.filename}`
  });
  
  console.log(`Uploaded to: ${uploadResult.secure_url}`);
  
  // 4. Create database record
  const submission = await Submission.create({
    emailSubject: message.subject,
    emailFrom: message.from.address,
    attachmentFilename: attachment.filename,
    attachmentUrl: uploadResult.secure_url,
    status: 'pending',
    createdAt: new Date()
  });
  
  // 5. Emit event to Kafka
  await kafkaProducer.send({
    topic: 'ingestion-events',
    messages: [{
      key: submission._id.toString(),
      value: JSON.stringify({
        type: 'EMAIL_RECEIVED',
        submissionId: submission._id.toString(),
        attachmentUrl: uploadResult.secure_url
      })
    }]
  });
  
  console.log(`✅ Submission ${submission._id} created`);
}
```

**MongoDB Document Created:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "emailSubject": "Invoice #12345",
  "emailFrom": "vendor@example.com",
  "attachmentFilename": "invoice.pdf",
  "attachmentUrl": "https://res.cloudinary.com/...",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### **Step 3: OCR Processing**

```typescript
// OCR service listens to Kafka
kafkaConsumer.subscribe(['ingestion-events']);

await kafkaConsumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    
    if (event.type !== 'EMAIL_RECEIVED') return;
    
    console.log(`📄 Starting OCR for ${event.submissionId}`);
    
    // 1. Update status
    await Submission.updateOne(
      { _id: event.submissionId },
      { status: 'processing-ocr' }
    );
    
    // 2. Download file from Cloudinary
    const fileBuffer = await downloadFromUrl(event.attachmentUrl);
    
    // 3. Perform OCR using Tesseract
    const extractedText = await performOCR(fileBuffer);
    
    console.log(`Extracted ${extractedText.length} characters`);
    
    // 4. Save extracted text
    await Submission.updateOne(
      { _id: event.submissionId },
      {
        extractedText: extractedText,
        status: 'ocr-complete'
      }
    );
    
    // 5. Emit next event
    await kafkaProducer.send({
      topic: 'ocr-events',
      messages: [{
        key: event.submissionId,
        value: JSON.stringify({
          type: 'TEXT_EXTRACTED',
          submissionId: event.submissionId,
          text: extractedText
        })
      }]
    });
    
    console.log(`✅ OCR complete for ${event.submissionId}`);
  }
});
```

**Extracted Text Example:**
```
INVOICE

Invoice No: 12345
Date: January 15, 2024

Bill To:
Acme Corporation
123 Main Street

Description          Qty    Price    Total
-----------------------------------------
Web Development       40h    $100    $4,000
Hosting (Annual)       1     $500      $500
-----------------------------------------
                            TOTAL:  $4,500
```

### **Step 4: AI Classification**

```typescript
// Classification service listens to Kafka
kafkaConsumer.subscribe(['ocr-events']);

await kafkaConsumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    
    if (event.type !== 'TEXT_EXTRACTED') return;
    
    console.log(`🤖 Classifying ${event.submissionId}`);
    
    // 1. Prepare AI prompt
    const prompt = `
      Analyze this document and classify it into ONE category:
      - Invoice: Bills for payment
      - Receipt: Proof of payment
      - Contract: Legal agreements
      - Letter: Correspondence
      - Form: Applications or forms
      
      Document text:
      ${event.text}
      
      Respond with ONLY the category name.
    `;
    
    // 2. Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const classification = result.response.text().trim();
    
    console.log(`Classified as: ${classification}`);
    
    // 3. Save classification
    await Submission.updateOne(
      { _id: event.submissionId },
      {
        classification: classification,
        status: 'complete'
      }
    );
    
    // 4. Publish to Redis for real-time dashboard update
    await redisClient.publish('document-updates', JSON.stringify({
      submissionId: event.submissionId,
      status: 'complete',
      classification: classification
    }));
    
    console.log(`✅ Classification complete for ${event.submissionId}`);
  }
});
```

### **Step 5: Dashboard Real-Time Update**

```typescript
// Frontend: Dashboard component

'use client';

import { useEffect, useState } from 'react';
import { Redis } from 'ioredis';

export function DashboardClient() {
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    // 1. Connect to Redis
    const redis = new Redis({
      host: process.env.NEXT_PUBLIC_REDIS_HOST,
      port: 6379
    });
    
    // 2. Subscribe to updates
    redis.subscribe('document-updates');
    
    // 3. Listen for messages
    redis.on('message', (channel, message) => {
      const update = JSON.parse(message);
      
      // 4. Update UI immediately
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc._id === update.submissionId
            ? { ...doc, status: update.status, classification: update.classification }
            : doc
        )
      );
      
      // 5. Show notification
      toast.success(`Document classified as ${update.classification}!`);
    });
    
    return () => redis.disconnect();
  }, []);
  
  return (
    <div>
      <h1>Document Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Status</th>
            <th>Classification</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc._id}>
              <td>{doc.attachmentFilename}</td>
              <td>{doc.status}</td>
              <td>{doc.classification || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Complete Journey Visualization:**
```
1. EMAIL ARRIVES
   ↓
   📧 "Invoice #12345" + invoice.pdf
   
2. INGESTION
   ↓
   ✅ Saved to MongoDB
   ✅ Uploaded to Cloudinary
   ✅ Kafka event emitted
   
3. OCR
   ↓
   ✅ Downloaded file
   ✅ Extracted text: "INVOICE\nDate: Jan 15..."
   ✅ Updated MongoDB
   ✅ Kafka event emitted
   
4. CLASSIFICATION
   ↓
   ✅ AI analyzed text
   ✅ Classified as: "Invoice"
   ✅ Updated MongoDB
   ✅ Redis pub/sub update
   
5. DASHBOARD
   ↓
   🎉 User sees: "invoice.pdf - Invoice ✓"
```

---

## **TypeScript Best Practices Explained**

### **1. Strict Type Checking** ✅

**What it means:** TypeScript checks your code for errors BEFORE running it

**Bad Example (JavaScript):**
```javascript
function processDocument(doc) {
  return doc.text.toUpperCase(); // Crashes if doc.text is undefined!
}

processDocument({ title: "Invoice" }); // Runtime error! 💥
```

**Good Example (TypeScript):**
```typescript
interface Document {
  id: string;
  text: string;
  status: 'pending' | 'complete'; // Only these values allowed
}

function processDocument(doc: Document): string {
  return doc.text.toUpperCase(); // TypeScript ensures doc.text exists
}

// This will show an error BEFORE running:
processDocument({ title: "Invoice" }); // ❌ Missing 'text' property
```

**Benefits:**
- Catch bugs during development
- Better autocomplete in VS Code
- Self-documenting code

### **2. Interface Definitions in `types.ts`** 📋

**Centralized type definitions:**

```typescript
// server/src/types.ts

/** Event emitted when a new email is ingested */
export interface IngestionEvent {
  /** Unique identifier for the submission */
  submissionId: string;
  
  /** Email subject line */
  subject: string;
  
  /** Cloudinary URL of the attachment */
  attachmentUrl: string;
  
  /** ISO timestamp */
  timestamp: string;
}

/** Event emitted after OCR processing */
export interface OcrEvent {
  submissionId: string;
  
  /** Extracted text from the document */
  extractedText: string;
  
  /** Confidence score (0-100) */
  confidence: number;
}

/** All possible document categories */
export type DocumentCategory = 
  | 'Invoice'
  | 'Receipt'
  | 'Contract'
  | 'Letter'
  | 'Form'
  | 'Other';
```

**Why this is important:**
- **Single source of truth:** All services use the same types
- **Refactoring safety:** Change a type, TypeScript shows all places needing updates
- **Team collaboration:** New developers understand data structures instantly

### **3. Async/Await for Promises** ⏳

**Old Way (Callback Hell):**
```javascript
// 😱 Hard to read, hard to debug
fetchEmail(emailId, function(error, email) {
  if (error) handleError(error);
  
  downloadAttachment(email, function(error, file) {
    if (error) handleError(error);
    
    uploadToCloud(file, function(error, url) {
      if (error) handleError(error);
      console.log('Done!');
    });
  });
});
```

**Modern Way (Async/Await):**
```typescript
// 😊 Clean, readable, easy to debug
async function processEmail(emailId: string) {
  try {
    const email = await fetchEmail(emailId);
    const file = await downloadAttachment(email);
    const url = await uploadToCloud(file);
    
    console.log('Done!');
  } catch (error) {
    handleError(error);
  }
}
```

### **4. Error Handling with Try-Catch** 🛡️

```typescript
async function classifyDocument(submissionId: string) {
  try {
    // Get document from database
    const submission = await getSubmission(submissionId);
    
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    
    if (!submission.extractedText) {
      throw new Error(`Submission ${submissionId} has no extracted text`);
    }
    
    // Call AI service
    const classification = await askGeminiAI(submission.extractedText);
    
    // Save result
    await updateSubmission(submissionId, {
      classification: classification,
      status: 'complete'
    });
    
    return classification;
    
  } catch (error) {
    // Log error with context
    console.error('Classification failed:', {
      submissionId,
      error: error.message,
      stack: error.stack
    });
    
    // Update status to failed
    await updateSubmission(submissionId, {
      status: 'failed',
      errorMessage: error.message
    });
    
    // Re-throw to trigger retry
    throw error;
  }
}
```

**Best Practices:**
- **Validate inputs:** Check data exists before using it
- **Specific error messages:** Include IDs and context
- **Update status:** Let users know something failed
- **Log errors:** Help debugging in production

### **5. JSDoc Comments for Documentation** 📖

```typescript
/**
 * Processes a document through the OCR pipeline
 * 
 * @param submissionId - Unique identifier of the submission
 * @param options - Optional processing configuration
 * @param options.language - Language code for OCR (default: 'eng')
 * @param options.enhanceImage - Apply image enhancement (default: true)
 * 
 * @returns Promise resolving to extracted text
 * 
 * @throws {NotFoundError} If submission doesn't exist
 * @throws {OcrError} If OCR processing fails
 * 
 * @example
 * ```typescript
 * const text = await performOCR('abc123', { language: 'spa' });
 * console.log(text); // "Hola mundo..."
 * ```
 */
async function performOCR(
  submissionId: string,
  options?: {
    language?: string;
    enhanceImage?: boolean;
  }
): Promise<string> {
  // Implementation...
}
```

---

## **Summary: Why This Architecture Works**

### **1. Scalability** 📈
- Each service can run on different servers
- Add more instances if one service is slow
- Handle millions of documents

### **2. Reliability** 🛡️
- If OCR service crashes, emails still get ingested
- Kafka stores messages until processed
- Retry mechanism handles temporary failures

### **3. Maintainability** 🔧
- Each service has one job (easy to understand)
- TypeScript catches errors early
- Clear separation of concerns

### **4. Real-Time Updates** ⚡
- Dashboard updates instantly via Redis pub/sub
- No page refresh needed
- Users see progress in real-time

### **5. Testability** ✅
- Mock external services in tests
- Test each service independently
- Clear interfaces make testing easy

---

## **Next Steps for Learning**

1. **Start with one service:** Understand the Lambda service first
2. **Follow data flow:** Track a document from email to dashboard
3. **Read the code:** Look at actual implementation in `server/src/`
4. **Experiment:** Change classification categories, add new events
5. **Ask questions:** Every "why?" leads to deeper understanding

**Remember:** Complex systems are just simple systems connected together! 🚀

---

# **Detailed Architecture Documentation**

## **🎯 Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│   Gmail/IMAP │   MongoDB    │  Cloudinary  │  Google AI   │  Kafka/Redis   │
│   (Email)    │  (Database)  │  (Storage)   │  (Gemini)    │  (Infrastructure)
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │              │                │
       │              │              │              │                │
┌──────▼──────────────▼──────────────▼──────────────▼────────────────▼───────┐
│                        NESTJS APPLICATION (PORT 3000)                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                     MAIN APPLICATION BOOTSTRAP                      │    │
│  │  (main.ts) - Initializes HTTP + Kafka Microservice                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        APP MODULE                                    │   │
│  │  Imports: Ingestion, OCR, Proxy, Lambda, Classification,            │   │
│  │           Analysis, EventPipeline                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    EVENT-DRIVEN PROCESSING PIPELINE                   │  │
│  │                                                                        │  │
│  │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │  │
│  │   │   LAMBDA    │────▶│  INGESTION  │────▶│     OCR     │           │  │
│  │   │  SERVICE    │     │   SERVICE   │     │   SERVICE   │           │  │
│  │   │             │     │             │     │             │           │  │
│  │   │ @Cron Job   │     │ Kafka Sub:  │     │ Kafka Sub:  │           │  │
│  │   │ 30 sec      │     │ submission. │     │ ocr.init    │           │  │
│  │   │             │     │ found       │     │             │           │  │
│  │   │ • IMAP Poll │     │             │     │ • Tesseract │           │  │
│  │   │ • Parse Email│     │ • Save to   │     │ • PDF-Parse │           │  │
│  │   │ • Upload to │     │   MongoDB   │     │ • Extract   │           │  │
│  │   │   Cloudinary│     │ • Emit OCR  │     │   Text      │           │  │
│  │   │ • Emit Event│     │   Event     │     │ • Emit      │           │  │
│  │   └─────────────┘     └─────────────┘     │   Classify  │           │  │
│  │                                            │   Event     │           │  │
│  │                                            └──────┬──────┘           │  │
│  │                                                   │                   │  │
│  │                       ┌───────────────────────────▼───────┐          │  │
│  │                       │    CLASSIFICATION SERVICE         │          │  │
│  │                       │                                   │          │  │
│  │                       │  Kafka Sub: classification.init   │          │  │
│  │                       │                                   │          │  │
│  │                       │  • Gemini AI                      │          │  │
│  │                       │  • Document Classification        │          │  │
│  │                       │  • Confidence Scoring             │          │  │
│  │                       │  • Emit Complete Event            │          │  │
│  │                       └───────────────────────────────────┘          │  │
│  │                                                                        │  │
│  │   ┌────────────────────────────────────────────────────────────┐     │  │
│  │   │            EVENT PIPELINE SERVICE                           │     │  │
│  │   │                                                              │     │  │
│  │   │  Kafka Sub: event.pipeline                                  │     │  │
│  │   │                                                              │     │  │
│  │   │  • Updates submission status in MongoDB                     │     │  │
│  │   │  • Updates attachment metadata                              │     │  │
│  │   │  • Publishes status to Redis                                │     │  │
│  │   └────────────────────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       HTTP REST API ENDPOINTS                         │  │
│  │                                                                        │  │
│  │   GET  /proxy  - Fetch all submissions with attachments              │  │
│  │   (ProxyController → ProxyService)                                    │  │
│  │                                                                        │  │
│  │   (Internal Kafka endpoints - not exposed via HTTP)                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     SHARED LIBRARIES & HELPERS                        │  │
│  │                                                                        │  │
│  │   • lib/kafka.ts      - Kafka client and message publishing          │  │
│  │   • lib/redis.ts      - Redis client for caching                     │  │
│  │   • lib/mongo.ts      - MongoDB connection                           │  │
│  │   • lib/imap.ts       - IMAP email utilities                         │  │
│  │   • helpers/parser.ts - Email parsing & Cloudinary upload            │  │
│  │   • helpers/genAi.ts  - Gemini AI prompt building                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        DATA MODELS (MongoDB)                          │  │
│  │                                                                        │  │
│  │   • models/submission.ts - Email metadata & status                    │  │
│  │   • models/attachment.ts - Attachment details & classifications       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────┐
                         │   KAFKA EVENT TOPICS     │
                         ├──────────────────────────┤
                         │ submission.found         │
                         │ ocr.init                 │
                         │ classification.init      │
                         │ event.pipeline           │
                         └──────────────────────────┘

                         ┌──────────────────────────┐
                         │   REDIS CACHE KEYS       │
                         ├──────────────────────────┤
                         │ redis:status:{id}        │
                         │ ocr:status:{id}          │
                         └──────────────────────────┘
```

---

## **📂 Detailed Folder & File Explanation**

### **1. Root Configuration Files**

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Defines Kafka and Redis containers for local development |
| `package.json` | NPM dependencies and scripts (`build`, `start`, `dev`, `test`) |
| `tsconfig.json` | TypeScript compiler configuration |
| `nest-cli.json` | NestJS CLI configuration |
| `.env` | Environment variables (MongoDB, Kafka, Redis, Cloudinary, IMAP, Gemini API) |

---

### **2. `src/main.ts` - Application Bootstrap**

**Responsibilities:**
- Creates the main NestJS application
- Configures Kafka microservice with consumer group `ocr-consumer`
- Starts HTTP server on port 3000 (or `process.env.PORT`)
- Connects to MongoDB database

**Key Code:**
```typescript
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.KAFKA,
  options: {
    client: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'ocr-consumer' },
  },
});
await app.startAllMicroservices();
await app.listen(3000);
```

---

### **3. `src/app.module.ts` - Root Module**

Imports all feature modules:
- **IngestionModule** - Handles email persistence
- **OcrModule** - Text extraction from documents
- **ClassificationModule** - AI document classification
- **EventPipelineModule** - Status tracking and updates
- **ProxyModule** - API endpoints for frontend
- **LambdaModule** - Email polling scheduler
- **AnalysisModule** - Placeholder for future analytics

---

### **4. Core Services (Event-Driven Pipeline)**

#### **A. Lambda Service** (`src/lambda/`)

**Purpose:** Email polling and initial processing

**Files:**
- `lambda.service.ts` - Main service logic
- `lambda.module.ts` - Module definition

**How it Works:**
1. **Cron Job** runs every 30 seconds (`@Cron` decorator)
2. **Connects to IMAP** server (Gmail) using `ImapFlow`
3. **Searches for unread emails**
4. **For each email:**
   - Parses using `mailparser` (extracts subject, sender, body)
   - Uploads attachments to **Cloudinary** (via `helpers/parser.ts`)
   - Generates unique `submission_id`
   - Publishes **Kafka event** to `submission.found` topic
5. **Marks email as seen** in IMAP

**Kafka Event Published:**
```typescript
{
  id: "unique-id",
  message: "submission_found",
  data: {
    metadata: {
      subject, sender, body, timestamp, id, 
      attachments: [{ filename, content_type, url }]
    }
  }
}
```

---

#### **B. Ingestion Service** (`src/ingestion/`)

**Purpose:** Persist email data to MongoDB

**Files:**
- `ingestion.service.ts` - Business logic
- `ingestion.controller.ts` - Kafka message handler (`@MessagePattern('submission.found')`)
- `ingestion.module.ts` - Module definition

**How it Works:**
1. **Listens** to Kafka topic `submission.found`
2. **Creates submission** document in MongoDB with status: `"ingestion in progress"`
3. **Creates attachment** document (if attachments exist)
4. **Links attachment** to submission via ObjectId reference
5. **Updates status** to `"ingestion done"`
6. **Publishes events:**
   - `event.pipeline` (status update)
   - `ocr.init` (trigger OCR processing)

**Database Schema:**
```typescript
Submission: { sender, body, timestamp, id, attachments: ObjectId, status }
```

---

#### **C. OCR Service** (`src/ocr/`)

**Purpose:** Extract text from images and PDFs

**Files:**
- `ocr.service.ts` - OCR processing logic
- `ocr.controller.ts` - Kafka listener (`@MessagePattern('ocr.init')`)
- `ocr.module.ts` - Module definition

**How it Works:**
1. **Listens** to Kafka topic `ocr.init`
2. **For each attachment:**
   - **Images:** Uses **Tesseract.js** for OCR
   - **PDFs:** Uses **pdf-parse** library
   - Downloads file from Cloudinary URL using `axios`
   - Extracts text and adds to attachment metadata
3. **Timeout protection** - 60 seconds per file
4. **Publishes events:**
   - `event.pipeline` (status update)
   - `classification.init` (trigger AI classification)
5. **Caches result** in Redis with 1-hour expiry

**Technologies:**
- `tesseract.js` - Image OCR
- `pdf-parse` - PDF text extraction
- `axios` - Download files from URLs

---

#### **D. Classification Service** (`src/classification/`)

**Purpose:** Classify documents using Google Gemini AI

**Files:**
- `classification.service.ts` - AI classification logic
- `classification.controller.ts` - Kafka listener (`@MessagePattern('classification.init')`)
- `classification.module.ts` - Module definition

**How it Works:**
1. **Listens** to Kafka topic `classification.init`
2. **For each attachment:**
   - Sends extracted text to **Google Gemini AI**
   - Uses prompt from `helpers/genAi.ts`
   - AI returns: `{ type: "invoice|receipt|contract|id_card|resume", confidence: 0-1 }`
3. **Updates attachment** with classification and confidence score
4. **Publishes event** to `event.pipeline` (final status update)

**AI Model:**
- Uses `@google/genai` SDK
- Model: `gemini-2.5-flash`
- Categories: invoice, receipt, contract, id_card, resume

---

#### **E. Event Pipeline Service** (`src/event-pipeline/`)

**Purpose:** Centralized status tracking and MongoDB updates

**Files:**
- `event-pipeline.service.ts` - Update logic
- `event-pipeline.controller.ts` - Kafka listener (`@MessagePattern('event.pipeline')`)
- `event-pipeline.module.ts` - Module definition

**How it Works:**
1. **Listens** to Kafka topic `event.pipeline`
2. **Updates submission status** in MongoDB (e.g., `"ocr_completed"`)
3. **Updates attachment metadata** with OCR text and classifications
4. **Maintains consistency** between submission and attachment documents

**Event Types Handled:**
- `ingestion_completed`
- `ocr_completed`
- `classification_completed`

---

#### **F. Proxy Service** (`src/proxy/`)

**Purpose:** REST API for frontend dashboard

**Files:**
- `proxy.service.ts` - Database query logic
- `proxy.controller.ts` - HTTP endpoint (`GET /proxy`)
- `proxy.module.ts` - Module definition

**How it Works:**
1. **HTTP GET** request to `/proxy`
2. **Fetches all submissions** from MongoDB
3. **Populates attachments** using Mongoose `.populate()`
4. **Returns JSON** with full submission and attachment data

**Response Format:**
```json
[
  {
    "sender": "user@example.com",
    "subject": "Invoice",
    "status": "classification_completed",
    "attachments": {
      "attachments": [
        {
          "filename": "invoice.pdf",
          "url": "https://cloudinary.com/...",
          "text": "extracted text...",
          "classification": "invoice",
          "confidence": 0.95
        }
      ]
    }
  }
]
```

---

### **5. Helper Modules**

#### **`helpers/parser.ts`**
- **extractBody()** - Extracts plain text from email (HTML/text)
- **extractAttachments()** - Uploads files to Cloudinary and returns metadata

#### **`helpers/genAi.ts`**
- **buildClassificationPrompt()** - Constructs AI prompt for document classification
- **generateContent()** - Calls Gemini AI API

#### **`helpers/cloudinary.service.ts`**
- **uploadImage()** - Uploads files to Cloudinary using streams

#### **`helpers/db.ts`**
- **dbConnect()** - Establishes MongoDB connection

---

### **6. Library Modules** (`lib/`)

#### **`lib/kafka.ts`**
- Kafka client initialization
- `publishMessage()` - Publishes events to topics

#### **`lib/redis.ts`**
- Redis client initialization
- Used for caching and real-time status updates

#### **`lib/mongo.ts`**
- MongoDB connection configuration

#### **`lib/imap.ts`**
- IMAP utilities (if any)

---

### **7. Data Models** (`models/`)

#### **`models/submission.ts`**
MongoDB schema for email submissions:
```typescript
{
  sender: String,
  body: String,
  timestamp: Date,
  id: String (unique),
  attachments: ObjectId (ref: Attachment),
  status: String (e.g., "classification_completed")
}
```

#### **`models/attachment.ts`**
MongoDB schema for attachments:
```typescript
{
  attachments: [{
    filename: String,
    content_type: String,
    url: String,
    text: String (OCR extracted),
    classification: String (AI result),
    confidence: Number (0-1)
  }]
}
```

---

### **8. Type Definitions** (`src/types.ts`)

Defines TypeScript interfaces for:
- **Attachment** - File metadata
- **IngestionObject** - Email ingestion payload
- **OcrObject** - OCR processing payload
- **ClassificationObject** - AI classification payload
- **Event** - Kafka event structure

---

## **🔄 Complete Processing Flow**

```
1. LAMBDA (Cron: 30s)
   ↓
   Polls Gmail IMAP → Finds unread email → Parses email
   ↓
   Uploads attachments to Cloudinary
   ↓
   Kafka: submission.found
   
2. INGESTION
   ↓
   Saves to MongoDB (submission + attachment)
   ↓
   Kafka: ocr.init, event.pipeline
   
3. OCR
   ↓
   Downloads files → Tesseract (images) / pdf-parse (PDFs)
   ↓
   Extracts text → Updates attachment.text
   ↓
   Kafka: classification.init, event.pipeline
   
4. CLASSIFICATION
   ↓
   Sends text to Gemini AI → Gets classification + confidence
   ↓
   Updates attachment.classification, attachment.confidence
   ↓
   Kafka: event.pipeline
   
5. EVENT PIPELINE
   ↓
   Updates MongoDB status at each step
   ↓
   Redis: Caches status for real-time dashboard
   
6. DASHBOARD (Frontend)
   ↓
   GET /proxy → Fetches all submissions with attachments
   ↓
   Displays real-time processing status
```

---

## **🔑 Key Design Patterns**

1. **Event-Driven Architecture** - Kafka ensures loose coupling between services
2. **Microservices Pattern** - Each module handles one responsibility
3. **Cron Scheduling** - Automated email polling every 30 seconds
4. **Pub/Sub Pattern** - Redis for real-time status updates
5. **Repository Pattern** - Mongoose models abstract database access
6. **Dependency Injection** - NestJS services are injectable
7. **Error Handling** - Try-catch blocks with logging at each stage

---

## **🚀 Running the Server**

```bash
# Start infrastructure
cd server && docker-compose up -d

# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm run build
npm run start:prod
```

---

## **📊 Technology Stack**

### **Backend Framework**
- **NestJS** - Progressive Node.js framework with TypeScript
- **Node.js** - JavaScript runtime

### **Databases & Storage**
- **MongoDB** - NoSQL database for submissions and attachments
- **Redis** - In-memory cache for real-time status updates
- **Cloudinary** - Cloud storage for email attachments

### **Message Queue**
- **Apache Kafka** - Event streaming platform for microservices communication

### **Email Processing**
- **ImapFlow** - IMAP client for email polling
- **mailparser** - Email parsing library

### **OCR & Document Processing**
- **Tesseract.js** - OCR engine for images
- **pdf-parse** - PDF text extraction

### **AI & Machine Learning**
- **Google Gemini AI** - Document classification (gemini-2.5-flash model)
- **@google/genai** - Google AI SDK

### **Development Tools**
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization for local development

---

## **🔐 Environment Variables**

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# Email/IMAP
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Kafka
KAFKA_BROKER=localhost:9092
BOOTSTRAP_SERVER=localhost:9092

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Document Classification
DOC_PROMPT_INSTRUCTION="You are an expert AI document classification system..."
DOC_PROMPT_CATEGORIES='["invoice", "receipt", "contract", "id_card", "resume"]'
DOC_PROMPT_EXAMPLES="invoice: contains billing info..."

# Cron Schedule
CRON_SCHEDULE=*/30 * * * * *
```

---

## **🧪 Testing**

The project includes comprehensive test coverage:

### **Unit Tests**
Each service has corresponding `.spec.ts` files:
- `ingestion.service.spec.ts`
- `ocr.service.spec.ts`
- `classification.service.spec.ts`
- `event-pipeline.service.spec.ts`
- `proxy.service.spec.ts`

### **E2E Tests**
End-to-end tests in `test/app.e2e-spec.ts`

### **Running Tests**
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **1. Kafka Connection Errors**
```bash
# Ensure Kafka is running
docker-compose up -d kafka

# Check Kafka logs
docker logs kafka-container
```

#### **2. Redis Connection Errors**
```bash
# Ensure Redis is running
docker-compose up -d redis

# Test connection
redis-cli ping
```

#### **3. MongoDB Connection Issues**
- Verify `MONGODB_URI` format
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

#### **4. IMAP Email Polling Issues**
- Enable 2-factor authentication in Gmail
- Generate app password (not regular password)
- Enable IMAP in Gmail settings
- Check firewall for port 993

#### **5. OCR Processing Timeouts**
- Large files may exceed 60-second timeout
- Increase timeout in `ocr.service.ts`
- Check Cloudinary URL accessibility

#### **6. Gemini AI Classification Errors**
- Verify `GEMINI_API_KEY` is valid
- Check API quotas in Google Cloud Console
- Ensure billing is enabled

---

## **📈 Performance Optimization**

### **Current Optimizations**
1. **Redis Caching** - 1-hour expiry for OCR results
2. **Kafka Partitioning** - Parallel processing of events
3. **Timeout Protection** - 60-second OCR timeout prevents hanging
4. **Batch Processing** - Lambda processes one email at a time to prevent overload

### **Recommended Improvements**
1. **Worker Pools** - Implement worker threads for OCR processing
2. **Rate Limiting** - Add rate limits to Gemini AI calls
3. **Queue Management** - Implement dead letter queues for failed events
4. **Database Indexing** - Add indexes on `submission.id` and `status`
5. **Connection Pooling** - Configure MongoDB connection pools
6. **Horizontal Scaling** - Deploy multiple instances behind load balancer

---

## **🚀 Deployment Guide**

### **Option 1: Render.com**
1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Deploy with build command: `npm run build`
5. Start command: `npm run start:prod`

### **Option 2: Heroku**
1. Install Heroku CLI
2. `heroku create app-name`
3. Set config vars: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### **Option 3: AWS/GCP/Azure**
1. Use Docker for containerization
2. Deploy to ECS/Cloud Run/App Service
3. Configure managed Kafka (Confluent Cloud)
4. Use managed Redis (Redis Cloud)

### **Option 4: Docker Compose (Full Stack)**
```yaml
version: '3.8'
services:
  kafka:
    image: apache/kafka
  redis:
    image: redis
  mongodb:
    image: mongo
  app:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - kafka
      - redis
      - mongodb
```

---

## **📚 API Documentation**

### **REST Endpoints**

#### **GET /proxy**
Fetches all submissions with populated attachments.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "sender": "user@example.com",
    "body": "Email body content",
    "timestamp": "2025-11-07T10:30:00.000Z",
    "id": "unique-email-id",
    "status": "classification_completed",
    "attachments": {
      "_id": "507f1f77bcf86cd799439012",
      "attachments": [
        {
          "filename": "invoice.pdf",
          "content_type": "application/pdf",
          "url": "https://res.cloudinary.com/...",
          "text": "Extracted text from PDF...",
          "classification": "invoice",
          "confidence": 0.95
        }
      ]
    },
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:31:00.000Z"
  }
]
```

### **Kafka Topics**

#### **submission.found**
Published by: Lambda Service
Consumed by: Ingestion Service

#### **ocr.init**
Published by: Ingestion Service
Consumed by: OCR Service

#### **classification.init**
Published by: OCR Service
Consumed by: Classification Service

#### **event.pipeline**
Published by: All services
Consumed by: Event Pipeline Service

---

## **🎯 Future Enhancements**

1. **Analysis Module** - Currently placeholder, can add:
   - Trend analysis
   - Document statistics
   - Reporting features

2. **Webhook Support** - Notify external systems on completion

3. **Multi-language OCR** - Support for languages beyond English

4. **Advanced Classification** - Fine-tuned models for specific document types

5. **Audit Logging** - Track all document processing steps

6. **User Management** - Authentication and authorization

7. **Bulk Processing** - Handle multiple emails in parallel

8. **Document Versioning** - Track changes to classified documents

---

## **📝 Code Quality Standards**

### **NestJS Best Practices Followed**
- ✅ Dependency Injection for all services
- ✅ Module-based architecture
- ✅ Controller-Service separation
- ✅ DTOs for data validation (can be enhanced)
- ✅ Exception filters for error handling
- ✅ Logging with NestJS Logger
- ✅ Environment configuration
- ✅ Unit and E2E tests

### **TypeScript Best Practices**
- ✅ Strict type checking
- ✅ Interface definitions in `types.ts`
- ✅ Async/await for promises
- ✅ Error handling with try-catch
- ✅ JSDoc comments for documentation

---

This architecture provides a **scalable, maintainable, and production-ready** document processing pipeline with clear separation of concerns and robust error handling! 🎯
