import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { HotelDetailsService } from '../../services/hotel-details/hotel-details.service';

@ApiUseTags('Tour Diez')
@Controller('tour-diez')
export class HotelDetailsController {
  constructor(private readonly hotelDetailsService: HotelDetailsService) {}

  @Get('/publish-hotel-details')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotelContent() {
    return this.hotelDetailsService.publishALlhHotelDetails();
  }
}
