import { Test, TestingModule } from '@nestjs/testing';
import { EventPipelineService } from './event-pipeline.service';

describe('EventPipelineService', () => {
  let service: EventPipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventPipelineService],
    }).compile();

    service = module.get<EventPipelineService>(EventPipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
