import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import { AxiosResponse } from 'axios';
import { Page } from '../../dto/pages.dto';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { Model, Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import axios from 'axios';
import { ServerHotelInterface } from '../../interfaces/provider/hotel.interface';
import { HotelServerResponse } from '../../interfaces/provider/server-hotel-response.interface';
import { ConfigService } from '../../../../config/config.service';
import { Configuration } from '../../../../config/config.keys';
import { Logger } from 'winston';
import { CreateHotelAdapter } from '../../adapters/hotel.adapter';
import path from 'path';

@Injectable()
export class HotelService {
  version = '1.1';
  language = 'es';
  pass: string;
  login: string;
  totalPages = 0;
  page = 1;

  headers = {
    'Content-Type': 'text/xml',
    'Accept-Encoding': 'gzip, deflate',
  };
  query = '/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL';
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
  hotels: ServerHotelInterface[] | undefined;
  hotelsIds!: Hotel[];

  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('word_to_meet_hotels')
    private readonly hotelModel: Model<Hotel>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelAdapter: CreateHotelAdapter,
  ) {
    /**
     * load data from process.env
     */
    this.pass = this.configService.get(Configuration.WORLD_TO_ME_PASSWORD);
    this.login = this.configService.get(Configuration.WORLD_TO_ME_LOGIN);
    this.url =
      this.configService.get(Configuration.WORLD_TO_ME_URL) + this.query;
  }

  async publishHotels(): Promise<void> {
    let response: AxiosResponse;

    const request = `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns="http://www.juniper.es/webservice/2007/">
        <soapenv:Header/>
        <soapenv:Body>
            <HotelPortfolio>
                <HotelPortfolioRQ Version="${this.version}" Language="${this.language}">
                    <Login Password="${this.pass}" Email="${this.login}"/>
                </HotelPortfolioRQ>
            </HotelPortfolio>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });

      /**
       * validate if server response contain error message
       */
      // console.log(response);
      if (await this.Validator(String(response))) {
        throw new HttpException(
          String(response),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const json: HotelServerResponse = parser.parse(
        response.data,
        this.options,
      );

      const pages = new Page(json);

      /**
       * save pages number to this.page to be checkered on subscriber for the next que
       */
      this.totalPages = pages.totalPages;

      if (pages.totalPages > 0) {
        for (let i = 1; i <= pages.totalPages; i++) {
          // lunch first que
          this.amqpConnection.publish(
            'word_to_meet_hotels',
            'word_to_meet_hotels',
            i,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      // console.log(error);
    }
  }

  async publishHotelsPages(page: number): Promise<void> {
    try {
      this.amqpConnection.publish(
        'word_to_meet_hotels',
        'word_to_meet_hotels',
        page,
      );
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  @RabbitSubscribe({
    exchange: 'word_to_meet_hotels',
    routingKey: 'word_to_meet_hotels',
    queue: 'word_to_meet_hotels',
  })
  async subscribeHotels(page: number): Promise<Nack | undefined> {
    this.logger.info(`Processing world to me hotels - page: ${page}`);
    let hotels: any;
    let haveError: boolean = false;

    const request = `
    <soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns="http://www.juniper.es/webservice/2007/">
    <soapenv:Header/>
    <soapenv:Body>
        <HotelPortfolio>
            <HotelPortfolioRQ Version="${this.version}" Language="${this.language}" Page="${page}">
                <Login Password="${this.pass}" Email="${this.login}"/>
            </HotelPortfolioRQ>
        </HotelPortfolio>
    </soapenv:Body>
</soapenv:Envelope>
    `;

    /**
     * xml server response as type AxiosResponse
     */
    let response: AxiosResponse;
    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });

      const json: HotelServerResponse = await parser.parse(
        response.data,
        this.options,
      );

      hotels =
        json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS
          .HotelPortfolio.Hotel;
    } catch (error) {
      // provider error repeat this request request
      // console.log(error, 'hotes from query');
      haveError = true;
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
    /**
     *  save data to database
     */

    if (hotels) {
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
        } catch (error) {
          // do do - implement log
          this.logger.error(
            path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
          );
          haveError = true;
        }

        // to du automatic init next task
        /**
         * total pages init to 0 and pages init to 1
         * only corresponded the last page
         */
      }
      if (Number(this.totalPages) === Number(page)) {
        // publish-hotels-content
        // console.log('run ');
        const _ = await axios.get(
          `${this.configService.get(
            Configuration.HOST,
          )}/hotel-details/publish-hotels-details`,
        );
        // console.log(_.status);
        if (_.status === 204) {
          this.totalPages = 0;
        }
      }
    }
    /**
     * check if the current page is the last page
     */

    if (haveError) {
      return new Nack(true);
    }
  }

  async getHotels() {
    return this.hotelModel.find();
  }

  async getHotel(hotelId: string) {
    return this.hotelModel.findOne({ hotelId });
  }

  Validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
  }; // tslint:disable-line
}
