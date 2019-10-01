import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import { AxiosResponse } from 'axios';
import { ServerHotelInterface } from '../../interfaces/work-to-me/provider/hotel.interface';
import { HotelServerResponse } from '../../interfaces/work-to-me/provider/server-hotel-response.interface';
import { Page } from '../../dto/pages.dto';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import axios from 'axios';

@Injectable()
export class HotelService {
  version = '1.1';
  language = 'en';
  pass = 'gw7yx6qU';
  login = 'XMLTestCandamena';
  totalPages = 0;
  page = 1;

  headers = {
    'Content-Type': 'text/xml',
    'Accept-Encoding': 'gzip, deflate',
  };
  url =
    'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL';

  request = `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns="http://www.juniper.es/webservice/2007/">
        <soapenv:Header/>
        <soapenv:Body>
            <HotelPortfolio>
                <HotelPortfolioRQ Version="${this.version}" Language="${this.language}" Page="${this.page}" RecordsPerPage="500" >
                    <Login Password="${this.pass}" Email="${this.login}"/>
                </HotelPortfolioRQ>
            </HotelPortfolio>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

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
  HaveError: boolean = false;

  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('hotels') private readonly hotelModel: Model<Hotel>,
  ) {}

  async publishHotels(): Promise<void> {
    let response: AxiosResponse;

    try {
      response = await axios.post(this.url, this.request, {
        headers: this.headers,
      });

      /**
       * validate if server response contain error message
       */

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
          this.amqpConnection.publish('workToMe', 'hotels', i);
        }
      }
    } catch (error) {
      this.HaveError = true;
      throw error;
    }
  }

  async publishHotelsPages(page: number): Promise<void> {
    try {
      this.amqpConnection.publish('workToMe', 'hotels', page);
    } catch (error) {
      this.HaveError = true;
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotels',
    queue: 'hotels',
  })
  async subscribeHotels(page: number): Promise<Nack | undefined> {
    this.page = page;

    /**
     * xml server response as type AxiosResponse
     */
    let response: AxiosResponse;
    try {
      response = await axios.post(this.url, this.request, {
        headers: this.headers,
      });

      const json: HotelServerResponse = await parser.parse(
        response.data,
        this.options,
      );
      this.hotels =
        json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.Hotel;
    } catch (error) {
      // provider error repeat this request request
      this.HaveError = true;
      // do do - implement log
    }
    /**
     *  save data to database
     */

    if (this.hotels) {
      this.hotels.forEach(async (hotel: ServerHotelInterface) => {
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
          this.HaveError = true;
        }
      });

      /**
       * check if the current page is the last page
       */

      if (this.HaveError) {
        return new Nack(true);
      }

      if (Number(this.totalPages) === Number(page)) {
        // publish-hotels-content

        await axios.post('./work-to-me/publish-hotels-content');
      }
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
