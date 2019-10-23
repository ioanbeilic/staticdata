import { Controller, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { HotelsService } from '../../services/hotels/hotels.service';

@ApiUseTags('Tor Travel')
@Controller('tor-travel')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('/publish-hotels')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotels() {
    return this.hotelsService.getCity();
  }
}
