import { Controller, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { DownloadService } from '../../services/download/download.service';
import { HotelDetailsService } from '../../services/hotel-details/hotel-details.service';

@ApiUseTags('Tor Travel')
@Controller('tor-travel')
export class HotelDetailsController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly hotelDetailsService: HotelDetailsService,
  ) {}

  @Get('/publish-hotels')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishHotels() {
    return this.downloadService.getData();
  }
  /*
  @Get('/publish-hotel-details')
  @ApiOperation({ title: 'create and insert object to database' })
  @ApiNoContentResponse({
    description: 'generate object from local files and insert to database',
  })
  @ApiBadRequestResponse({ description: "don't have any  data to hard drive" })
  public publishHotelDetails() {
    return this.hotelDetailsService.saveHotelsDetails();
  }
  */
}
