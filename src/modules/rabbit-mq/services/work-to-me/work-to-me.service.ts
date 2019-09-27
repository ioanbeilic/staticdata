import {
  Injectable,
  HttpService,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ServerHotelInterface } from '../../interfaces/work-to-me/provider/hotel.interface';
import { HotelServerResponse } from '../../interfaces/work-to-me/provider/server-hotel-response.interface';
import { Page } from '../../interfaces/work-to-me/pages.class';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import axios from 'axios';
import fs from 'fs';
import { ServerContentResponse } from '../../interfaces/work-to-me/provider/server-content-response.interface';

@Injectable()
export class WorkToMeService {
  version = '1.1';
  language = 'en';
  pass = 'gw7yx6qU';
  login = 'XMLTestCandamena';
  totalPages = 0;

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
    private readonly amqpConnection: AmqpConnection,
    @InjectModel('hotels') private readonly hotelModel: Model<Hotel>,
  ) {}

  async getHotelsPageNumber() {
    const request = `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns="http://www.juniper.es/webservice/2007/">
        <soapenv:Header/>
        <soapenv:Body>
            <HotelPortfolio>
                <HotelPortfolioRQ Version="${this.version}" Language="${this.language}$">
                    <Login Password="${this.pass}" Email="${this.login}"/>
                </HotelPortfolioRQ>
            </HotelPortfolio>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

    let response: AxiosResponse;

    try {
      response = await axios.post(
        'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
        request,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept-Encoding': 'gzip, deflate',
          },
        },
      );

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
      throw error;
    }
  }

  /**
   *
   * @param page
   * auto subscribe to queue
   */

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotels',
    queue: 'hotels',
  })
  async getHotels(page: number): Promise<Nack | undefined> {
    const request = `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns="http://www.juniper.es/webservice/2007/">
        <soapenv:Header/>
        <soapenv:Body>
            <HotelPortfolio>
                <HotelPortfolioRQ Version="${this.version}" Language="${this.language}$" Page="${page}" RecordsPerPage="100">
                    <Login Password="${this.pass}" Email="${this.login}"/>
                </HotelPortfolioRQ>
            </HotelPortfolio>
        </soapenv:Body>
    </soapenv:Envelope>
    `;
    let response;
    try {
      response = await axios.post(
        'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
        request,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept-Encoding': 'gzip, deflate',
          },
        },
      );
    } catch (error) {
      // provider error repeat this request request
      return new Nack(true);
    }

    const json: HotelServerResponse = await parser.parse(
      response.data,
      this.options,
    );
    this.hotels =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.Hotel;

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
              upsert: true,
              new: true,
            },
          );
        } catch (error) {
          // return new Nack(true);
          // console.log(error);
        }
      });

      /**
       * check if the current page is the last page
       */
      if (Number(this.totalPages) === Number(page)) {
        this.hotelsIds = await this.hotelModel.find().select('hotelId');
        // console.log(this.hotelsIds);
        this.hotelsIds.forEach((hotel: Partial<Hotel>) => {
          this.amqpConnection.publish(
            'workToMe',
            'hotelsContent',
            hotel.hotelId,
          );
        });
      }
    }
  }

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotelsContent',
    queue: 'hotelsContent',
  })
  async HotelContent(hotelId: string): Promise<Nack | undefined> {
    hotelId = 'JP031998';
    const request = `
    <soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns="http://www.juniper.es/webservice/2007/">
    <soapenv:Header/>
    <soapenv:Body>
        <HotelContent>
            <HotelContentRQ Version="${this.version}" Language="${this.language}">
                <Login Password="${this.pass}" Email="${this.login}"/>
                <HotelContentList>
                    <Hotel Code="${hotelId}"/>
                </HotelContentList>
            </HotelContentRQ>
        </HotelContent>
    </soapenv:Body>
</soapenv:Envelope>
    `;

    let response;
    try {
      response = await axios.post(
        'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
        request,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept-Encoding': 'gzip, deflate',
          },
        },
      );
    } catch (error) {
      // provider error repeat this request request
      return new Nack(true);
    }

    const json: ServerContentResponse = await parser.parse(
      response.data,
      this.options,
    );

    const hotelContent =
      json.Envelope.Body.HotelContentResponse.ContentRS.Contents;

    /*
    fs.writeFile('./data.xml', response.data, err => {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });

    fs.writeFile('./data.json', JSON.stringify(json), err => {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
    */
  }

  Validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
  }; // tslint:disable-line
}
