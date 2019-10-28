import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { HotelDetailsService } from '../../services/hotel-details/hotel-details.service';

@ApiUseTags('Beds Online')
@Controller('beds-online')
export class HotelDetailsController {
  constructor(private hotelDetailsService: HotelDetailsService) {}

  /**
   * get data for all hotels
   */

  @Get('/publish-hotels-details')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotels() {
    return this.hotelDetailsService.publishHotelsDetails();
  }
}
