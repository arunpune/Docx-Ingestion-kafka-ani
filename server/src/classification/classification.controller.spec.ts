import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationController } from './classification.controller';
import { ClassificationModule } from './classification.module';

describe('ClassificationController', () => {
  let controller: ClassificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClassificationModule],
    }).compile();

    controller = module.get<ClassificationController>(ClassificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
