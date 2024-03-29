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
import { Model } from 'mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import { InjectModel } from '@nestjs/mongoose';
import { CreateHotelAdapter } from '../../adapters/hotel.adapter';
import _ from 'lodash';
import * as iconv from 'iconv-lite';

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

  count = 0;
  hotels: any;

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
    this.pass = this.configService.get(Configuration.TOUR_DIEZ_PASSWORD_V3);
    this.user = this.configService.get(Configuration.TOUR_DIEZ_USER_V3);
    this.url = this.configService.get(Configuration.TOUR_DIEZ_URL_V3);
  }

  async login(): Promise<string | undefined> {
    let response: AxiosResponse;

    let providerSessionID: string;

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

      providerSessionID = json.LoginResult.sessionID;

      return providerSessionID;
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async publishHotels() {
    const providerSessionID = await this.login();

    const pRequest = `<?xml version="1.0" encoding="ISO-8859-1"?><getAllHotels><user>${this.user}</user><password>${this.pass}</password></getAllHotels>`;

    this.amqpConnection.publish('tour_diez_hotels', 'tour_diez_hotels', {
      pRequest,
      providerSessionID,
    });
  }

  @RabbitSubscribe({
    exchange: 'tour_diez_hotels',
    routingKey: 'tour_diez_hotels',
    queue: 'tour_diez_hotels',
  })
  async subscribeHotels(que: { pRequest: string; providerSessionID: string }) {
    let response: AxiosResponse;

    const providerSessionID: string = que.providerSessionID;
    let haveError: boolean = false;
    let operationCode: string;

    // console.log(que.providerSessionID);

    response = await axios.post(
      this.url,
      qs.stringify({
        pOperacion: 'getAllHotels',
        pRequest: que.pRequest,
      }),
      {
        headers: this.headers,
      },
    );

    const json = await parser.parse(
      iconv.decode(response.data, 'ISO-8859-1'),
      this.options,
    );

    if (_.has(json, 'ErrorResult')) {
      haveError = true;
    } else {
      /**
       * {
       *  ErrorResult: {
       *    result: {
       *      cod_result: 'M16',
       *      des_result: 'XML de entrada Incorrecto, no existe o no puede ser procesado.',
       *      type_message: 'E'
       *    }
       *  }
       * }
       */

      const codResult = json.hotelDescriptionsResult.result.cod_result;
      operationCode = json.hotelDescriptionsResult.operationCode;

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

        if (operationCode) {
          const pRequest = `<?xml version="1.0" encoding="ISO-8859-1"?><getAllHotels><user>${this.user}</user><password>${this.pass}</password><operationCode>${operationCode}</operationCode></getAllHotels>`;
          this.amqpConnection.publish('tour_diez_hotels', 'tour_diez_hotels', {
            pRequest,
            providerSessionID,
          });
        } else {
          // curl -X GET "http://localhost:4000/tour-diez/publish-hotel-details" -H "accept: application/json"

          const __ = await axios.get(
            `${this.configService.get(
              Configuration.HOST,
            )}/tour-diez/publish-hotel-details`,
          );
          // console.log(_.status);
          if (__.status !== 204) {
            this.logger.error(
              path.resolve(__filename) +
                ' ---> ' +
                'Failed to start Tour Diez hotel static data download',
            );
          }
        }
      }
    }

    if (haveError) {
      operationCode = '';
      this.publishHotels();
      // return new Nack(false);
    }
  }

  async getHotels() {
    return this.hotelModel.find();
  }
}
