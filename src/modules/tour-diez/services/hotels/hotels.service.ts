import { Injectable, Inject } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Configuration } from '../../../../config/config.keys';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { Logger } from 'winston';
import { ConfigService } from '../../../../config/config.service';
import path from 'path';
import axios from 'axios';
import * as parser from 'fast-xml-parser';
import qs from 'querystring';
import { ServerHotelInterface } from '../../interfaces/provider/hotel.interface';
import { Model } from 'mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import { InjectModel } from '@nestjs/mongoose';
import { CreateHotelAdapter } from '../../adapters/hotel.adapter';

@Injectable()
export class HotelsService {
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
    @InjectModel('tour_diez_hotels') private readonly hotelModel: Model<Hotel>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelAdapter: CreateHotelAdapter,
  ) {
    /**
     * load data from process.env
     */
    this.pass = this.configService.get(Configuration.TOUR_DIEZ_PASSWORD);
    this.user = this.configService.get(Configuration.TOUR_DIEZ_uSER);
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

      /**
       * {
       *  LoginResult: {
       *    result: {
       *      cod_result: 'M1',
       *      des_result: 'Operaci�n correcta.',
       *      type_message: 'I'
       *    },
       *    sessionID: 'e49f7d42-053a-4ba5-8cec-f8db55a1dfc2'
       *  }
       * }
       */

      this.sessionID = json.LoginResult.sessionID;
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async publishHotels() {
    await this.login();

    const pRequest = `<?xml version="1.0" encoding="ISO-8859-1"?><getAllHotels><sessionID>${this.sessionID}</sessionID></getAllHotels>`;

    this.amqpConnection.publish(
      'tour_diez_hotels',
      'tour_diez_hotels',
      pRequest,
    );
  }

  Validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
    // tslint:disable-next-line
  }; // tslint:disable-line

  @RabbitSubscribe({
    exchange: 'tour_diez_hotels',
    routingKey: 'tour_diez_hotels',
    queue: 'tour_diez_hotels',
  })
  async subscribeHotels(pRequest: string) {
    let response: AxiosResponse;

    let haveError: boolean = false;

    response = await axios.post(
      this.url,
      qs.stringify({
        pOperacion: 'getAllHotels',
        pRequest,
      }),
      {
        headers: this.headers,
      },
    );

    const json: ServerHotelInterface = await parser.parse(
      response.data,
      this.options,
    );

    const codResult = json.hotelDescriptionsResult.result.cod_result;
    let operationCode = json.hotelDescriptionsResult.operationCode;

    if (codResult !== 'M1') {
      haveError = true;
    } else {
      const hotels =
        json.hotelDescriptionsResult.hotelDescriptions.hotelDescriptionsBean;

      for (const hotel of hotels) {
        const createHotel = this.createHotelAdapter.transform(hotel);
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

          /**
           * after save to database send new requset
           */
        } catch (error) {
          haveError = true;
          this.logger.error(
            path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
          );
        }
      }

      // to du automatic init next task
      /**
       * total pages init to 0 and pages init to 1
       * only corresponded the last page
       */
    }

    if (haveError) {
      operationCode = '';
      this.publishHotels();
      return new Nack(false);
    }

    /**
     * total pages init to 0 and pages init to 1
     * only corresponded the last page
     */
    if (operationCode) {
      const _ = `<?xml version="1.0" encoding="ISO-8859-1"?><getAllHotels><operationCode>${operationCode}</operationCode><sessionID>${this.sessionID}</sessionID></getAllHotels>`;
      this.amqpConnection.publish('tour_diez_hotels', 'tour_diez_hotels', _);
    }
  }
}
