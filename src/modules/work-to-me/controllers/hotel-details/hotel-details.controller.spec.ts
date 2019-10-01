import { Test, TestingModule } from '@nestjs/testing';
import { HotelDetailsController } from './hotel-details.controller';

describe('HotelDetails Controller', () => {
  let controller: HotelDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelDetailsController],
    }).compile();

    controller = module.get<HotelDetailsController>(HotelDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
