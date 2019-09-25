import { Injectable, HttpService } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WorkToMeHotel } from '../../interfaces/work-to-me/provider/hotel.interface';
import { IHotelServerResponse } from '../../interfaces/work-to-me/provider/server-response.interface';
import { Page } from '../../interfaces/work-to-me/pages.class';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import { HotelSchema } from '../../schemas/hotelschema';
import fs from 'fs';
import axios from 'axios';

@Injectable()
export class WorkToMeService {
  version = '1.1';
  language = 'en';
  pass = 'gw7yx6qU';
  login = 'XMLTestCandamena';

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
  hotels: WorkToMeHotel[] | undefined;

  constructor(
    private readonly httpService: HttpService,
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

      const json: IHotelServerResponse = parser.parse(
        response.data,
        this.options,
      );

      const pages = new Page(json);

      if (pages.totalPages > 0) {
        this.hotelModel.collection.drop();

        for (let i = 1; i <= pages.totalPages; i++) {
          this.amqpConnection.publish('workToMe', 'hotels', i);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotels',
    queue: 'hotels',
  })
  async getHotels(page: number): Promise<any> {
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

    const json: IHotelServerResponse = await parser.parse(
      response.data,
      this.options,
    );
    this.hotels =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.Hotel;

    if (this.hotels) {
      this.hotels.forEach(async (hotel: WorkToMeHotel) => {
        const newHotel = new CreateHotelDto(hotel);
        try {
          return await this.hotelModel.findOneAndUpdate(
            newHotel.hotelId,
            new this.hotelModel(newHotel),
            {
              upsert: true,
              new: true,
            },
          );
        } catch (error) {
          return new Nack(true);
        }
      });
    }
  }
}
