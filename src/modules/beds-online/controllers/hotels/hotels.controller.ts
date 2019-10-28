import { Controller, Get } from '@nestjs/common';
import { HotelsService } from '../../services/hotels/hotels.service';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUseTags,
} from '@nestjs/swagger';

@ApiUseTags('Beds Online')
@Controller('beds-online')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

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
