import { Controller, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { HotelService } from '../../services/hotel/hotel.service';

@ApiUseTags('Abreu / hotels')
@Controller('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  /**
   * get data for all hotels
   */

  @Get('/publish-hotels')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public getCountries() {
    return this.hotelService.getCountry();
  }
}
