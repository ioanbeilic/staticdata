import { Controller, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { HotelDetailsService } from '../../services/hotel-details/hotel-details.service';

@ApiUseTags('Abreu / hotels')
@Controller('hotel-details')
export class HotelDetailsController {
  constructor(private hotelDetailsService: HotelDetailsService) {}

  /**
   * get data for all hotels
   */

  @Get('//publish-hotel-details')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get a county list, automatic run task to get all city list and for each city get the hotels',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotelsDetails() {
    return this.hotelDetailsService.publishHotelsDetails();
  }
}
