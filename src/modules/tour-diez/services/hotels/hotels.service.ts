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
    // @InjectModel('work_to_me_hotels') private readonly hotelModel: Model<Hotel>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger, // private createHotelAdapter: CreateHotelAdapter,
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

    let response: AxiosResponse;

    const pRequest = `<?xml version="1.0" encoding="ISO-8859-1"?><getAllHotels><sessionID>${this.sessionID}</sessionID></getAllHotels>`;

    try {
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

      /**
       * validate if server response contain error message
       */

      /*
      if (await this.Validator(String(response.data))) {
        throw new HttpException(
          String(response),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
*/

      /**
       * {
       *    hotelDescriptionsResult: {
       *      result: {
       *        cod_result: 'M3',
       *        des_result: 'Se ha producido un error en el Sistema. Reintente la operaci�n y si el error persiste contacte con el proveedor.',
       *        type_message: 'E'
       *      }
       *    }
       *  }
       */
      const json = parser.parse(response.data, this.options);

      if (json.hotelDescriptionsResult.result.cod_result === 'M5') {
        this.login();
      }

      /*
      const pages = new Page(json);

      /**
       * save pages number to this.page to be checkered on subscriber for the next que
       */

      /*
      this.totalPages = pages.totalPages;

      if (pages.totalPages > 0) {
        for (let i = 1; i <= pages.totalPages; i++) {
          // lunch first que
          this.amqpConnection.publish(
            'work_to_me_hotels',
            'work_to_me_hotels',
            i,
          );
        }
      }
         */
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      // console.log(error);
    }
  }

  Validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
    // tslint:disable-next-line
  }; // tslint:disable-line

  @RabbitSubscribe({
    exchange: 'work_to_me_hotels',
    routingKey: 'work_to_me_hotels',
    queue: 'work_to_me_hotels',
  })
  async subscribeHotels(page: number): Promise<Nack | undefined> {
    const haveError = false;

    if (haveError) {
      return new Nack(true);
    }
  }
}
