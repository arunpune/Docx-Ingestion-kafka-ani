# AI Assistant Instructions for Document Ingestion Dashboard

## Project Overview
This is a document processing system that ingests emails, extracts text using OCR, classifies documents with AI, and provides real-time monitoring. The project uses a microservices architecture with NestJS backend and Next.js frontend.

## Key Architecture Components

### Backend (NestJS)
- **Event-Driven Processing Pipeline** (`server/src/event-pipeline/`):
  - Documents flow through: Email → OCR → Classification → Dashboard
  - Use Kafka for inter-service communication
  - Status updates stored in Redis cache for real-time tracking

### Frontend (Next.js)
- **Dashboard** (`client/app/dashboard/`):
  - Real-time monitoring using Redis pub/sub
  - Components built with shadcn/ui and Tailwind CSS

## Development Workflows

### Local Setup
1. Start infrastructure:
```bash
cd server && docker-compose up -d
```

2. Required environment variables in `server/.env`:
- `MONGODB_URI`: MongoDB connection string
- `GOOGLE_API_KEY`: Gemini AI API key
- `CLOUDINARY_*`: Cloudinary credentials
- `IMAP_*`: Email server credentials

### Testing Patterns
- Controller tests use `@nestjs/testing` TestingModule
- Service tests mock external dependencies (Kafka, Redis, MongoDB)
- Example: `server/src/ingestion/ingestion.service.spec.ts`

## Project-Specific Patterns

### Service Communication
- Services communicate through Kafka events defined in `server/src/types.ts`
- Event pipeline ensures ordered processing:
  1. `IngestionEvent`: New email received
  2. `OcrEvent`: Document text extracted
  3. `ClassificationEvent`: AI categorization complete

### Error Handling
- Failed events are retried with exponential backoff
- Processing status tracked in MongoDB and Redis
- Errors logged with submission ID for tracing

## Integration Points
- **MongoDB**: Document storage and status tracking
- **Redis**: Real-time updates and caching
- **Kafka**: Inter-service message queue
- **Cloudinary**: File storage for attachments
- **Google Gemini AI**: Document classification
- **IMAP**: Email polling (uses ImapFlow library)

## Code Generation Guidelines
- Follow NestJS module structure for new services
- Use shadcn/ui components for frontend UI
- Implement proper event typing from `server/src/types.ts`
- Add MongoDB schemas to `server/src/models/`