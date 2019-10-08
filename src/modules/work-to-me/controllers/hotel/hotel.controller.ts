import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { HotelService } from '../../services/hotel/hotel.service';
import {
  ApiIdParamPage,
  FindOneParamPage,
} from '../parameters/find-one-page.params';
import {
  ApiIdParamHotel,
  FindOneHotel,
} from '../parameters/find-one-hotel.params';

@ApiUseTags('Work To Me')
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
  public publishHotels() {
    return this.hotelService.publishHotels();
  }

  /**
   *  update data for a specific page
   * @param page number
   */

  @Get('/publish-hotels/:page')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Add page to be processed with RabbitMq' })
  @ApiIdParamPage()
  @ApiNoContentResponse({
    description: 'The message has ben successfully added to queue',
  })
  @ApiBadRequestResponse({ description: 'The page number does not exist' })
  public async publishHotelsPages(@Param() { page }: FindOneParamPage): Promise<
    void
  > {
    return this.hotelService.publishHotelsPages(page);
  }

  @Get('/hotels')
  @ApiOperation({ title: 'get all hotels' })
  @ApiNoContentResponse({
    description: 'get all hotels from database',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public getHotels() {
    return this.hotelService.getHotels();
  }

  @Get('/hotel/:hotelId')
  @ApiOperation({ title: 'get hotel ny id' })
  @ApiIdParamHotel()
  @ApiNoContentResponse({
    description: 'Get hotel from local database by id',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public getHotel(@Param() { hotelId }: FindOneHotel) {
    return this.hotelService.getHotel(hotelId);
  }
}
