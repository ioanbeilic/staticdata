import { Test, TestingModule } from '@nestjs/testing';
import { BedsOnlineController } from './beds-online.controller';

describe('BedsOnline Controller', () => {
  let controller: BedsOnlineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BedsOnlineController],
    }).compile();

    controller = module.get<BedsOnlineController>(BedsOnlineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
