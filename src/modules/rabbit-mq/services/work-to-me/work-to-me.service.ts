import { Injectable, HttpService, Inject } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import fs from 'fs';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Hotel } from '../../interfaces/hotel.interface';
import { IHotelServerResponse } from '../../interfaces/hotel-server-response.interface';
import { Page } from '../../interfaces/pages.class';
import { AmqpConnection, RabbitSubscribe } from '@nestjs-plus/rabbitmq';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { Model } from 'mongoose';

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

  pagesOptions = {
    attributeNamePrefix: '',
    attrNodeName: '', // false, string, undefined
    textNodeName: '_',
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

  /**
   * hotel Option get only the values from xml
   */
  hotelOptions = {
    ignoreAttributes: true,
    parseNodeValue: true,
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly amqpConnection: AmqpConnection,
    @Inject('HOTEL_MODEL') private readonly hotelModel: Model<Hotel>,
  ) {}

  getHotelsPageNumber() {
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

    const data = this.httpService.post(
      'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
      request,
      {
        headers: {
          'Content-Type': 'text/xml',
          'Accept-Encoding': 'gzip, deflate',
        },
      },
    );

    data.subscribe(async (_: AxiosResponse) => {
      const json: IHotelServerResponse = parser.parse(
        _.data,
        this.pagesOptions,
      );

      const pages = new Page(json);

      for (let i = 0; i < pages.totalPages; i++) {
        await this.amqpConnection.publish('workToMe', 'hotels', {
          i,
        });
      }

      /*

      fs.writeFile('./revived.json', JSON.stringify(pages), err => {
        if (err) {
          return console.log(err); // tslint:disable-line
        }

        console.log('The file was saved!'); // tslint:disable-line
      });
      */
    });
  }

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotels',
    queue: 'hotels',
  })
  getHotels(page: number): Observable<AxiosResponse<Hotel[]>> {
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

    const data = this.httpService.post(
      'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
      request,
      {
        headers: {
          'Content-Type': 'text/xml',
          'Accept-Encoding': 'gzip, deflate',
        },
      },
    );

    data.subscribe(async (_: AxiosResponse) => {
      const json: IHotelServerResponse = parser.parse(
        _.data,
        this.hotelOptions,
      );
      const hotels =
        json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS
          .HotelPortfolio.Hotel;

      if (hotels !== undefined) {
        hotels.forEach(hotel => {
          this.create(hotel);
        });
      }
    });
    return data;
  }

  async create(createHotelDto: CreateHotelDto): Promise<void> {
    const createdCat = new this.hotelModel(createHotelDto);
    await createdCat.save();
  }
}
