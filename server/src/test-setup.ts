// Global jest setup and mocks for external services
import 'reflect-metadata';

// Mock Kafka service
jest.mock('src/lib/kafka', () => ({
  kafkaService: {
    publishMessage: jest.fn().mockResolvedValue(undefined),
    getProducer: jest.fn(),
    createConsumer: jest.fn(),
    subscribeToTopic: jest.fn(),
  },
}));

// Mock Redis singleton API
jest.mock('src/lib/redis', () => ({
  redis: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
  },
}));

// Mock axios for HTTP calls
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock tesseract for OCR
jest.mock('tesseract.js', () => ({
  __esModule: true,
  default: {
    recognize: jest.fn().mockResolvedValue({ data: { text: '' } }),
  },
}));

// Mock pdf-parse
jest.mock('pdf-parse', () => jest.fn().mockResolvedValue({ text: '' }));

// Mock GenAI helper used in classification
jest.mock('src/helpers/genAi', () => ({
  generateContent: jest.fn().mockResolvedValue({ text: '{"type":"unknown","confidence":0}' }),
}));

// Mock Mongoose models used directly in services
jest.mock('src/models/submission', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([]) }),
    findOne: jest.fn().mockResolvedValue(null),
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
    create: jest.fn(),
  },
}));

jest.mock('src/models/attachment', () => ({
  __esModule: true,
  default: {
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
    create: jest.fn(),
  },
}));

// Ensure timers are modern for promise-based timers
jest.useRealTimers();


