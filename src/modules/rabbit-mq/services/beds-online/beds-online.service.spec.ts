import { Test, TestingModule } from '@nestjs/testing';
import { BedsOnlineService } from './beds-online.service';

describe('BedsOnlineService', () => {
  let service: BedsOnlineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BedsOnlineService],
    }).compile();

    service = module.get<BedsOnlineService>(BedsOnlineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
