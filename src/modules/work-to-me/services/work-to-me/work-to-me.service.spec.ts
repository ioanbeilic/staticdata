import { Test, TestingModule } from '@nestjs/testing';
import { WorkToMeService } from './work-to-me.service';

describe('WorkToMeService', () => {
  let service: WorkToMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkToMeService],
    }).compile();

    service = module.get<WorkToMeService>(WorkToMeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
