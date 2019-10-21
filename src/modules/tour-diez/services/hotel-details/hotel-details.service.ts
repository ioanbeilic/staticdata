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
  sessionID!: string;

  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('tour_diez_hotel-details')
    private readonly hotelModel: Model<HotelDetails>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelAdapter: CreateHotelAdapter,
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

      return json.LoginResult.sessionID;
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
        hotel.hotelId,
      );
    });
  }

  @RabbitSubscribe({
    exchange: 'tour_diez_hotel-details',
    routingKey: 'tour_diez_hotel-details',
    queue: 'tour_diez_hotel-details',
  })
  async subscribeHotelDetails(hotelId: string) {
    let response: AxiosResponse;
    const providerSessionID = await this.login();

    // let haveError: boolean = false;

    const pRequest: string = `
    <?xml version="1.0" encoding="ISO-8859-1"?>
    <getHotelDetails>
      <sessionID>${providerSessionID}</sessionID>
      <hotelID>${hotelId}</hotelID>
    </getHotelDetails>
    `;

    response = await axios.post(
      this.url,
      qs.stringify({
        pOperacion: 'getHotelDetails',
        pRequest,
      }),
      {
        headers: this.headers,
      },
    );

    const json: any = await parser.parse(response.data, this.options);
  }
}
