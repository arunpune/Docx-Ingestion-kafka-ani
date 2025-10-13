import { Test, TestingModule } from '@nestjs/testing';
import { EventPipelineController } from './event-pipeline.controller';
import { EventPipelineModule } from './event-pipeline.module';

describe('EventPipelineController', () => {
  let controller: EventPipelineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventPipelineModule],
    }).compile();

    controller = module.get<EventPipelineController>(EventPipelineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
