import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import submission from 'src/models/submission';
import attachment from 'src/models/attachment';
import { kafkaService } from 'src/lib/kafka';
import { redis } from 'src/lib/redis';

// Models and libs are globally mocked in test-setup

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestionService],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const baseMsg = {
    metadata: {
      id: 'id-1',
      subject: 'sub',
      sender: 'a@b.com',
      body: 'body',
      attachments: [
        { filename: 'a', content_type: 'x', url: 'u' },
      ],
    },
  };

  it('creates submission, attachments, updates, and publishes next events', async () => {
    (submission.create as unknown as jest.Mock).mockResolvedValue({ id: 'sub-1' });
    (attachment.create as unknown as jest.Mock).mockResolvedValue({ _id: 'att-1' });

    await service.ingestion(baseMsg as any);

    expect(submission.create).toHaveBeenCalled();
    expect(attachment.create).toHaveBeenCalled();
    expect(submission.updateOne).toHaveBeenCalledWith(
      { id: 'sub-1' },
      { $set: { attachments: 'att-1', status: 'ingestion done' } },
    );
    expect(redis.set).toHaveBeenCalled();
    expect(kafkaService.publishMessage).toHaveBeenCalledWith('event.pipeline', expect.any(Object));
    expect(kafkaService.publishMessage).toHaveBeenCalledWith('ocr.init', expect.any(Object));
  });

  it('throws when submission creation fails', async () => {
    (submission.create as unknown as jest.Mock).mockResolvedValue(null);
    await expect(service.ingestion(baseMsg as any)).rejects.toThrow();
  });
});


