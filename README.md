# Document Ingestion Dashboard

A comprehensive document processing system that automatically ingests emails, extracts text from attachments using OCR, classifies documents with AI, and provides a real-time dashboard for monitoring submissions.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Email Client  │───▶│   IMAP Polling  │───▶│   Kafka Queue   │
│   (Gmail/IMAP)  │    │   (NestJS Cron) │    │   (Events)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingestion     │───▶│   OCR Service   │───▶│ Classification  │
│   (MongoDB)     │    │   (Tesseract/   │    │   (Gemini AI)   │
│                 │    │    PDF-parse)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Event Pipeline│───▶│   Redis Cache   │───▶│   Dashboard     │
│   (Status Updates│    │   (Real-time)  │    │   (Next.js)     │
│    & Persistence)│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
├── client/                 # Next.js Frontend Application
│   ├── app/               # Next.js App Router
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/        # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
├── server/                # NestJS Backend Application
│   ├── src/
│   │   ├── analysis/     # Analysis module (placeholder)
│   │   ├── classification/ # Document classification
│   │   ├── event-pipeline/ # Event processing pipeline
│   │   ├── helpers/      # Utility helpers
│   │   ├── ingestion/    # Data ingestion
│   │   ├── lambda/       # IMAP polling service
│   │   ├── lib/          # External service integrations
│   │   ├── models/       # MongoDB schemas
│   │   ├── ocr/          # OCR processing
│   │   └── proxy/        # API proxy endpoints
│   ├── docker-compose.yml # Docker services
│   └── .env             # Environment variables
└── README.md            # This file
```

## 🚀 Features

### Backend Services
- **Email Ingestion**: Automated IMAP polling for new emails every 30 seconds
- **OCR Processing**: Text extraction from images (Tesseract) and PDFs (pdf-parse)
- **AI Classification**: Document categorization using Google Gemini AI
- **Event-Driven Architecture**: Kafka-based microservices communication
- **Real-time Updates**: Redis caching for status tracking
- **File Storage**: Cloudinary integration for attachment storage
- **Database Persistence**: MongoDB for submissions and attachments

### Frontend Dashboard
- **Real-time Monitoring**: Live email processing status
- **Attachment Viewer**: Direct links to processed documents
- **Responsive Design**: Modern UI with Tailwind CSS
- **Interactive Tables**: Sortable and filterable data views

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Message Queue**: Apache Kafka
- **Cache**: Redis
- **File Storage**: Cloudinary
- **OCR**: Tesseract.js, pdf-parse
- **AI**: Google Gemini AI
- **Email**: IMAP (ImapFlow)

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React hooks
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB Atlas account (or local MongoDB)
- Google Cloud account (for Gemini AI)
- Cloudinary account
- Gmail account with IMAP enabled

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/arunpune/Docx-Ingestion-kafka-ani.git

Change directory to root i.e Docx-Ingestion-kafka-ani if necessary
cd Docx-Ingestion-kafka-ani
```
### 2. Services  Setup

```open account on 
www.mongodb.com
mongodb uri
www.cloudinary.com
cloudinary api's
www.gmail.com


```

### 3. Docker  Setup
setup docker engine
start the docker desktop

### 3. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Environment Configuration
Create a `.env` file in the `server/` directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email/IMAP
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993

# Cloudinary
CLOUDINARY_URL=cloudinary://api-key:api-secret@cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=email-topic
BOOTSTRAP_SERVER=localhost:9092
KAFKAJS_NO_PARTITIONER_WARNING=1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000

#Gemini Api Key
GEMINI_API_KEY=your-gemini-api-key

DOC_PROMPT_INSTRUCTION="You are an expert AI document classification system trained to understand text layout, semantics, and context. Your goal is to identify the type of document accurately."
DOC_PROMPT_CATEGORIES='["invoice", "receipt", "contract", "id_card", "resume"]'
DOC_PROMPT_EXAMPLES="invoice: contains billing info, company names, payment details; receipt: includes prices, total, and items purchased; contract: includes parties, terms, signatures; id_card: has personal details and photo ID; resume: includes education, experience, and skills."
CRON_SCHEDULE=*/30 * * * * *
```

#### Start Infrastructure Services
```bash
# Start Kafka and Redis using Docker Compose
# Make Sure Your Docker Desktop is running
cd server
docker-compose up -d
```

#### Database Setup
The application will automatically create collections when first run.

#### Run Backend
```bash
# development
#which one to run ?
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../client
npm install
```

#### Environment Configuration
Create a `.env.local` file in the `client/` directory (if needed):

```env
# Add any client-side environment variables here
# Currently, the client connects directly to the backend API
```

#### Run Frontend
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

## 🔧 Configuration Details

### Gmail IMAP Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the App Password in `EMAIL_PASS`

### Google Gemini AI Setup
1. Create a Google Cloud Project
2. Enable the Generative AI API
3. Create an API key
4. The API key is configured in the code (see `genAi.ts`)

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your Cloud Name, API Key, and API Secret
3. Configure in the `.env` file

## 📡 API Endpoints

### Backend API
- `GET /proxy` - Retrieve all submissions with attachments
- `POST /ingestion` - Manual ingestion trigger (internal)
- `POST /ocr` - Manual OCR processing (internal)
- `POST /classification` - Manual classification (internal)

### Microservices Events (Kafka)
- `submission.found` - New email detected
- `ocr.init` - OCR processing request
- `classification.init` - Classification request
- `event.pipeline` - Status updates

## 🎯 Usage Guide

### Starting the System
1. Start infrastructure: `cd server && docker-compose up -d`
2. Start backend: `cd server && pnpm run start`
3. Start frontend: `cd client && npm run dev`
4. Access dashboard at `http://localhost:4000 or check console for changes`

### Processing Flow
1. **Email Detection**: System polls IMAP every 30 seconds
2. **Ingestion**: Email metadata and attachments saved to MongoDB
3. **OCR Processing**: Text extracted from images/PDFs
4. **Classification**: Documents categorized using AI
5. **Dashboard Update**: Real-time status updates in UI

### Monitoring
- View processed emails in the dashboard
- Check attachment classifications and confidence scores
- Monitor processing status (ingestion, OCR, classification)

## 🐳 Docker Deployment

### Using Docker Compose (Full Stack)
```yaml
# docker-compose.yml (root level)
version: '3.8'
services:
  kafka:
    image: apache/kafka
    ports:
      - "9092:9092"
  redis:
    image: redis
    ports:
      - "6379:6379"
  mongodb:
    image: mongo
    ports:
      - "27017:27017"
  backend:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - kafka
      - redis
      - mongodb
  frontend:
    build: ./client
    ports:
      - "3001:3000"
    depends_on:
      - backend
```

## 🔍 Troubleshooting

### Common Issues

**IMAP Connection Failed**
- Verify Gmail credentials and App Password
- Check firewall settings for port 993
- Ensure IMAP is enabled in Gmail settings

**OCR Processing Errors**
- Check file URLs are accessible
- Verify Cloudinary configuration
- Ensure sufficient memory for large files

**AI Classification Issues**
- Verify Google Cloud API key
- Check API quotas and billing
- Ensure network connectivity to Google services

**Database Connection**
- Verify MongoDB URI format
- Check network access to MongoDB Atlas
- Ensure database user has proper permissions

### Logs and Debugging
```bash
# Backend logs
cd server && npm run start:debug

# Frontend logs (browser console)
# Open browser dev tools in dashboard

# Kafka logs
docker logs kafka-container

# Redis logs
docker logs redis-container
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments for implementation details# Docx-Ingestion-kafka-ani
# Docx-Ingestion-kafka-ani
