import { Test, TestingModule } from '@nestjs/testing';
import { WotkToMeService } from './wotk-to-me.service';

describe('WotkToMeService', () => {
  let service: WotkToMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WotkToMeService],
    }).compile();

    service = module.get<WotkToMeService>(WotkToMeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
