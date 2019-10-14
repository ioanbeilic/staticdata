import { Module } from '@nestjs/common';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelsController } from './controllers/hotels/hotels.controller';
import { HotelsService } from './services/hotels/hotels.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';

@Module({
  controllers: [HotelsController, HotelDetailsController],
  providers: [HotelsService, HotelDetailsService],
})
export class TourDiezModule {}
