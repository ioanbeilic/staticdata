import { Injectable, Inject } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Configuration } from '../../../../config/config.keys';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { Logger } from 'winston';
import { ConfigService } from '../../../../config/config.service';
import path from 'path';
import axios from 'axios';
import * as parser from 'fast-xml-parser';

@Injectable()
export class HotelsService {
  pass: string;
  user: string;

  headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'gzip, deflate',
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

    const request = `
      <?xml version="1.0" encoding="ISO-8859-1"?>
        <Login>
            <user>${this.user}</user>
            <password>${this.pass}</password>
        </Login>
      `;

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });

      const json: any = await parser.parse(response.data, this.options);
      /*
      hotels =
        json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS
          .HotelPortfolio.Hotel;
*/
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
