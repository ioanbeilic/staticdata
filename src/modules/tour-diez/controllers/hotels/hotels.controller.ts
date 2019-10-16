import { Controller, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { HotelsService } from '../../services/hotels/hotels.service';

@ApiUseTags('Tour Diez')
@Controller('tour-diez')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

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
  public publishHotels() {
    return this.hotelsService.publishHotels();
  }
}
