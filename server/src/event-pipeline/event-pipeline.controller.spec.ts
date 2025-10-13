import { Test, TestingModule } from '@nestjs/testing';
import { EventPipelineController } from './event-pipeline.controller';

describe('EventPipelineController', () => {
  let controller: EventPipelineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPipelineController],
    }).compile();

    controller = module.get<EventPipelineController>(EventPipelineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
