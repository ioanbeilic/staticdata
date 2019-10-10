import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '../../../../config/config.service';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { Model } from 'mongoose';
import { HotelsService } from '../hotels/hotels.service';
import { HotelDetails } from '../../interfaces/hotel-details.interface';
import { Hotel } from '../../interfaces/hotel.interface';
import axios, { AxiosResponse } from 'axios';
import { Configuration } from '../../../../config/config.keys';
import { HotelDetailsProviderResponse } from '../../interfaces/provider/hotel-details-provider.interface';
import { Logger } from 'winston';
import { CreateHotelDetailsAdapter } from '../../adapters/hotel-details.adapter';
import path from 'path';

@Injectable()
export class HotelDetailsService {
  HaveError: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('beds_on_line_hotel-details')
    private readonly hotelModel: Model<HotelDetails>,
    private hotelsService: HotelsService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelDetailsAdapter: CreateHotelDetailsAdapter,
  ) {}

  async publishHotelsDetails() {
    const hotels = await this.hotelsService.getHotels();

    try {
      hotels.forEach((hotel: Hotel) => {
        this.amqpConnection.publish(
          'beds_online_hotel-detail',
          'beds_online_hotel-detail',
          hotel.hotelId,
        );
      });
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  /**
   * let response: AxiosResponse;
   * const query = ``;
   * const url = this.configService.get(Configuration.BEDS_ONLINE_URL) + query;
   */

  @RabbitSubscribe({
    exchange: 'beds_online_hotel-detail',
    routingKey: 'beds_online_hotel-detail',
    queue: 'beds_online_hotel-detail',
  })
  async subscribeHotelsDetails(hotelId: number): Promise<Nack | undefined> {
    /**
     * xml server response as type AxiosResponse
     */

    let response: AxiosResponse;

    const query = `/hotel-content-api/1.0/hotels/${hotelId}/details?language=ENG&useSecondaryLanguage=False`;

    const url = this.configService.get(Configuration.BEDS_ONLINE_URL) + query;

    try {
      response = await axios.get(url, {
        headers: this.hotelsService.generateHeaders(),
      });

      if (response.status === 200) {
        const data: HotelDetailsProviderResponse = response.data;

        const createHotel = this.createHotelDetailsAdapter.transform(
          data.hotel,
        );
        const newHotel = new this.hotelModel(createHotel);

        try {
          await this.hotelModel.findOneAndUpdate(
            { hotelId: newHotel.hotelId },
            {
              name: newHotel.name,
              description: newHotel.description,
              location: newHotel.location,
              city: newHotel.city,
              address: newHotel.address,
              province: newHotel.province,
              country: newHotel.country,
              postalCode: newHotel.postalCode,
              web: newHotel.web,
              phones: newHotel.phones,
              email: newHotel.email,
              category: newHotel.country,
              photos: newHotel.photos,
              facilities: newHotel.facilities,
              currency: newHotel.currency,
            },

            {
              /**
               * if is not exist create new one
               */
              upsert: true,
              new: true,
            },
          );
        } catch (error) {
          this.HaveError = true;
          this.logger.error('database', error);
          throw error;
          // do do - implement log
          // console.log(error, 'hotel-database');
        }
      }

      /**
       * check if the current page is the last page
       */

      if (this.HaveError) {
        return new Nack(true);
      }
    } catch (error) {
      this.HaveError = true;
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw error;
      // console.log(error);
      // do do - implement log
    }
  }

  async getHotelsDetails() {
    return this.hotelModel.find();
  }

  async getHotelDetail(hotelId: string) {
    return this.hotelModel.findOne({ hotelId });
  }
}
