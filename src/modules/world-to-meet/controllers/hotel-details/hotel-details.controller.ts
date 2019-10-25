import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HotelDetailsService } from '../../services/hotel-details/hotel-details.service';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUseTags,
} from '@nestjs/swagger';

@ApiUseTags('World To Meet')
@Controller('hotel-details')
export class HotelDetailsController {
  constructor(private hotelDetailsService: HotelDetailsService) {}

  /**
   * get data for all hotels
   */

  @Get('/publish-hotels-content')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotelContent() {
    return this.hotelDetailsService.publishALlhHotelContent();
  }
}
