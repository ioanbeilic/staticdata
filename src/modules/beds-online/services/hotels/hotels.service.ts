import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../../config/config.service';
import { Configuration } from '../../../../config/config.keys';
import CryptoJS from 'crypto-js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import axios, { AxiosResponse } from 'axios';
import { HotelProviderResponse } from '../../interfaces/provider/hotel-provider.interfce';
import { AmqpConnection, Nack, RabbitSubscribe } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';

@Injectable()
export class HotelsService {
  /**
   * provider query param
   */
  fields = 'all';
  language = 'ENG';
  useSecondaryLanguage = false;
  signature!: string;
  publicKey!: string;
  headers = {};
  query!: string;
  HaveError: boolean = false;
  totalPages: number = 0;

  constructor(
    private readonly configService: ConfigService,
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('beds_on_line_hotels')
    private readonly hotelModel: Model<Hotel>,
  ) {
    this.generateHeaders();
  }

  /**
   * generate app signature
   */
  generateApiKey() {
    // Begin UTC creation
    const utcDate = Math.floor(new Date().getTime() / 1000);
    // Begin Signature Assembly
    this.publicKey = this.configService.get(Configuration.BEDS_ONLINE_API_KEY);
    const privateKey = this.configService.get(Configuration.BEDS_ONLINE_SECRET);
    const assemble = this.publicKey + privateKey + utcDate;
    // Begin SHA-256 Encryption
    this.signature = CryptoJS.SHA256(assemble).toString(CryptoJS.enc.Hex);
  }

  generateHeaders() {
    this.generateApiKey();
    const headers = {
      'Api-key': this.publicKey,
      'X-Signature': this.signature,
      // prettier-ignore
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
    };

    return headers;
  }

  async publishHotels(): Promise<void> {
    let from: number = 1;
    let to: number = 1;

    let response: AxiosResponse;

    const query = `/hotel-content-api/1.0/hotels?fields=${this.fields}
    &language=${this.language}&from=${from}
    &to=${to}&useSecondaryLanguage=${this.useSecondaryLanguage}`;

    const url = this.configService.get(Configuration.BEDS_ONLINE_URL) + query;

    try {
      response = await axios.get(url, {
        headers: this.generateHeaders(),
      });

      /**
       * validate if server response contain error message
       */

      if (response.status === 200) {
        const data: HotelProviderResponse = response.data;
        /**
         * save pages number to this.totalPages to be checkered on subscriber for the next que
         */
        // console.log(response.data.total);
        /**
         * initializr fom to to 0
         */

        if (data.total > 0) {
          /**
           * calculate number of pages
           */
          this.totalPages = Math.ceil(data.total / 100);

          for (let i = 1; i <= this.totalPages; i++) {
            /**
             * rf i < 1 run page from 1 to 100
             * else run dorm 101 tp 200 .etc
             */

            if (i > 1) {
              from = i * 100 + 1;
            }

            to = i < this.totalPages ? from + 100 - 1 : data.total;

            // lunch first que
            this.amqpConnection.publish(
              'beds_online_hotels',
              'beds_online_hotels',
              { from, to },
            );
          }
        }
      }
    } catch (error) {
      this.HaveError = true;
      throw error;
    }
  }

  /**
   * hotel service subscriber
   */

  @RabbitSubscribe({
    exchange: 'beds_online_hotels',
    routingKey: 'beds_online_hotels',
    queue: 'beds_online_hotels',
  })
  async subscribeHotels({ from, to }: any): Promise<Nack | undefined> {
    /**
     * xml server response as type AxiosResponse
     */

    let response: AxiosResponse;

    const query = `/hotel-content-api/1.0/hotels?fields=${this.fields}
    &language=${this.language}&from=${from}
    &to=${to}&useSecondaryLanguage=${this.useSecondaryLanguage}`;

    const url = this.configService.get(Configuration.BEDS_ONLINE_URL) + query;

    try {
      response = await axios.get(url, {
        headers: this.generateHeaders(),
      });

      if (response.status === 200) {
        const data: HotelProviderResponse = response.data;

        for (const hotel of data.hotels) {
          const createHotel = new CreateHotelDto(hotel);
          const newHotel = new this.hotelModel(createHotel);
          try {
            await this.hotelModel.findOneAndUpdate(
              { hotelId: newHotel.hotelId },
              {
                hotelId: newHotel.hotelId,
                name: newHotel.name,
                zone: newHotel.zone,
                address: newHotel.address,
                zipCode: newHotel.zipCode,
                latitude: newHotel.latitude,
                longitude: newHotel.longitude,
                hotelCategory: newHotel.hotelCategory,
                city: newHotel.city,
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
            // do do - implement log
            // console.log(error, 'hotel-database');
            this.HaveError = true;
          }
        }

        /**
         * check if the current page is the last page
         */

        if (this.HaveError) {
          return new Nack(true);
        }

        if (Number(this.totalPages) === Number(to)) {
          // publish-hotels-content

          const _ = await axios.get(
            `${this.configService.get(
              Configuration.HOST,
            )}/beds-online/hotel-details/publish-hotels-content`,
          );
          // console.log(_.status);
          if (_.status === 204) {
            this.totalPages = 0;
          }
        }

        // to du automatic init next task
        /**
         * total pages init to 0 and pages init to 1
         * only corresponded the last page
         */
      }
    } catch (error) {
      this.HaveError = true;
      // console.log(error);
      // do do - implement log
    }
  }

  async getHotels() {
    return this.hotelModel.find();
  }

  async getHotel(hotelId: string) {
    return this.hotelModel.findOne({ hotelId });
  }
}
