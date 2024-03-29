import { Injectable, Inject } from '@nestjs/common';
import { ServerHotelInterface } from '../../interfaces/provider/hotel.interface';
import { Hotel } from '../../interfaces/hotel.interface';
import { ServerHotelContentInterface } from '../../interfaces/provider/content.interface';
import { HotelService } from '../hotel/hotel.service';
import { AmqpConnection } from '@nestjs-plus/rabbitmq/lib/amqp/connection';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelContent } from '../../interfaces/hotel-content.interface';
import { RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import axios, { AxiosResponse } from 'axios';
import { ServerContentResponse } from '../../interfaces/provider/server-content-response.interface';
import * as parser from 'fast-xml-parser';
import { CreateHotelDetailsDto } from '../../dto/create-hotel-details.dto';
import fs from 'fs';
import { Logger } from 'winston';
import { CreateHotelDetailsAdapter } from '../../adapters/hotel-details.adapter';
import path from 'path';

@Injectable()
export class HotelDetailsService {
  version = '1.1';
  language = 'es';
  pass = 'gw7yx6qU';
  login = 'XMLTestCandamena';
  totalPages = 0;
  hotelId!: string;

  headers = {
    'Content-Type': 'text/xml',
    'Accept-Encoding': 'gzip, deflate',
  };
  url =
    'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL';

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
  hotelContent!: ServerHotelContentInterface;

  constructor(
    private readonly hotelService: HotelService,
    private readonly amqpConnection: AmqpConnection,
    @InjectModel('word_to_meet_hotel-details')
    private readonly hotelContentModel: Model<HotelContent>,
    @Inject('winston') private readonly logger: Logger,
    private createHotelDetailsAdapter: CreateHotelDetailsAdapter,
  ) {}

  async publishALlhHotelContent() {
    const hotels = await this.hotelService.getHotels();
    // console.log('hotel-details');
    hotels.forEach((hotel: Hotel) => {
      this.amqpConnection.publish(
        'word_to_meet_hotel-details',
        'word_to_meet_hotel-details',
        hotel.hotelId,
      );
    });
  }

  async publishHotelContent(hotelId: string) {
    this.amqpConnection.publish(
      'word_to_meet_hotel-details',
      'word_to_meet_hotel-details',
      hotelId,
    );
  }

  @RabbitSubscribe({
    exchange: 'word_to_meet_hotel-details',
    routingKey: 'word_to_meet_hotel-details',
    queue: 'word_to_meet_hotels-details',
  })
  async HotelContent(hotelId: string): Promise<Nack | undefined> {
    // console.log(hotelId);

    this.logger.info(` Processing world to me hotel-details id: ${hotelId}`);

    let response: AxiosResponse;
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

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      this.HaveError = true;
      throw error;
    }

    const json: ServerContentResponse = await parser.parse(
      response.data,
      this.options,
    );

    this.hotelContent =
      json.Envelope.Body.HotelContentResponse.ContentRS.Contents.HotelContent;

    /*
    fs.appendFile('./hotel-content.json', JSON.stringify(json), err => {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
*/
    if (this.hotelContent !== undefined) {
      // const createHotelContent = new createHotelDetails(this.hotelContent);

      const hotelDetails = await this.createHotelDetailsAdapter.transform(
        this.hotelContent,
      );

      const newHotel = new this.hotelContentModel(hotelDetails);

      try {
        await this.hotelContentModel.findOneAndUpdate(
          { hotelId: newHotel.hotelId },
          {
            name: newHotel.name,
            description: newHotel.description,
            location: newHotel.location,
            city: newHotel.city,
            address: newHotel.address,
            province: newHotel.province,
            country: newHotel.country,
            postalCode: newHotel.postalCode,
            web: newHotel.web,
            phones: newHotel.phones,
            email: newHotel.email,
            category: newHotel.country,
            photos: newHotel.photos,
            facilities: newHotel.facilities,
            currency: newHotel.currency,
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
        this.HaveError = true;
        throw error;
      }
    }
    if (this.HaveError) {
      return new Nack(true);
    }
  }
  /*
      fs.writeFile('./hotelData.json', JSON.stringify(json), err => {
        if (err) {
          return console.log(err);
        }
        console.log('The file was saved!');
      });
      */
}
