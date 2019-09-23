import { Test, TestingModule } from '@nestjs/testing';
import { WorkToMeController } from './work-to-me.controller';

describe('WorkToMe Controller', () => {
  let controller: WorkToMeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkToMeController],
    }).compile();

    controller = module.get<WorkToMeController>(WorkToMeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
