import { Injectable, Inject, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { HotelDetails } from '../../interfaces/hotel-details.interface';
import { ConfigService } from '../../../../config/config.service';
import { CreateHotelAdapter } from '../../adapters/hotel.adapter';
import { Model } from 'mongoose';
import { Configuration } from '../../../../config/config.keys';
import axios, { AxiosResponse } from 'axios';
import * as parser from 'fast-xml-parser';
import path from 'path';
import qs from 'querystring';
import { HotelsService } from '../hotels/hotels.service';
import { Hotel } from '../../interfaces/hotel.interface';
import { ServerHotelDetailsResponse } from '../../interfaces/provider/server-content-response.interface';
import { CreateHotelDetailsAdapter } from '../../adapters/hotel-details.adapter';
import * as iconv from 'iconv-lite';

@Injectable()
export class HotelDetailsService {
  pass: string;
  user: string;

  headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    // 'Accept-Encoding': 'gzip, deflate',
  };
  url: string;

  /**
   * pages Options - convert xml to json
   * ignoreAttributes - get attribute field from xml
   */

  options = {
    attributeNamePrefix: '',
    attrNodeName: '', // false, string, undefined
    textNodeName: 'name',
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: '__cdata', // default is 'false'
    cdataPositionChar: '\\c',
    attrValueProcessor: (a: any) => a,
    tagValueProcessor: (a: any) => a,
  };
  providerSessionID!: string;

  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('tour_diez_hotel-details')
    private readonly hotelDetailsModel: Model<HotelDetails>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelDetailsAdapter: CreateHotelDetailsAdapter,
    private readonly hotelsService: HotelsService,
  ) {
    /**
     * load data from process.env
     */
    this.pass = this.configService.get(Configuration.TOUR_DIEZ_PASSWORD);
    this.user = this.configService.get(Configuration.TOUR_DIEZ_USER);
    this.url = this.configService.get(Configuration.TOUR_DIEZ_URL);
  }

  async login() {
    let response: AxiosResponse;

    const pRequest = `<?xml version="1.0" encoding="ISO-8859-1"?><Login><user>${this.user}</user><password>${this.pass}</password></Login>`;

    try {
      response = await axios({
        url: this.url,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          pOperacion: 'login',
          pRequest,
        }),
      });

      const json: any = await parser.parse(response.data, this.options);

      this.providerSessionID = json.LoginResult.sessionID;

      // return json.LoginResult.sessionID;
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async publishALlhHotelDetails() {
    const hotels = await this.hotelsService.getHotels();

    // console.log('hotel-details');
    hotels.forEach((hotel: Hotel) => {
      this.amqpConnection.publish(
        'tour_diez_hotel-details',
        'tour_diez_hotel-details',
        hotel,
      );
    });
  }

  @RabbitSubscribe({
    exchange: 'tour_diez_hotel-details',
    routingKey: 'tour_diez_hotel-details',
    queue: 'tour_diez_hotel-details',
  })
  async subscribeHotelDetails(hotel: Hotel) {
    let response: AxiosResponse;

    let haveError: boolean = false;

    if (!this.providerSessionID) {
      this.login();
    }

    const pRequest: string = `<?xml version="1.0" encoding="ISO-8859-1"?><getHotelDetails><sessionID>${this.providerSessionID}</sessionID><hotelID>${hotel.hotelId}</hotelID></getHotelDetails>`;

    try {
      response = await axios.post(
        this.url,
        qs.stringify({
          pOperacion: 'getHotelDetails',
          pRequest,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const json: ServerHotelDetailsResponse = await parser.parse(
        iconv.decode(response.data, 'ISO-8859-1'),
        this.options,
      );

      if (json.hotelDetails.result.cod_result === 'M5') {
        await this.login();
        haveError = true;
        return new Nack(false);
      }

      const hotelContent = json.hotelDetails.HotelDetailsBean;

      if (hotelContent !== undefined) {
        // const createHotelContent = new createHotelDetails(this.hotelContent);

        const hotelDetails = await this.createHotelDetailsAdapter.transform(
          hotelContent,
          hotel,
        );

        const newHotel = new this.hotelDetailsModel(hotelDetails);

        try {
          await this.hotelDetailsModel.findOneAndUpdate(
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
          // do do - implement log
          this.logger.error(
            path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
          );
          haveError = true;
          throw error;
        }
      }
      if (haveError) {
        return new Nack(true);
      }
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
