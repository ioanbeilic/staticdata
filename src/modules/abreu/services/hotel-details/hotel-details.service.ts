import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../../../../config/config.service';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { HotelDetails } from '../../interfaces/hotel-details.interface';
import { HotelService } from '../hotel/hotel.service';
import { Logger } from 'winston';
import { Hotel } from '../../interfaces/hotel.interface';
import axios, { AxiosResponse } from 'axios';
import { Configuration } from '../../../../config/config.keys';
import { Model } from 'mongoose';
import * as parser from 'fast-xml-parser';
import path from 'path';
import fs from 'fs';
import { CreateHotelDetailsAdapter } from '../../adapters/hotel-details.adapter';
import {
  HotelDetailsProvider,
  HotelDetailsProviderResponse,
} from '../../interfaces/provider/hotel-details-response.interface';

@Injectable()
export class HotelDetailsService {
  password: string;
  username: string;
  url: string;
  context: string;

  headers = {
    'Content-Type': 'text/xml',
  };

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

  HaveError: boolean = false;

  countCityQue = 0;
  countHotelQue = 0;
  language = 'ES';

  constructor(
    private readonly configService: ConfigService,
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('abreu_hotel-details')
    private readonly hotelModel: Model<HotelDetails>,
    private hotelService: HotelService,
    @Inject('winston') private readonly logger: Logger,
    private createHotelDetailsAdapter: CreateHotelDetailsAdapter,
  ) {
    this.context = this.configService.get(Configuration.ABREU_CONTEXT);
    this.password = this.configService.get(Configuration.ABREU_PASSWORD);
    this.username = this.configService.get(Configuration.ABREU_USERNAME);
    this.url = this.configService.get(Configuration.ABREU_URL_DETAILS);
  }

  async publishHotelsDetails() {
    const hotels = await this.hotelService.getHotels();

    try {
      for (const hotel of hotels) {
        this.amqpConnection.publish(
          'abreu_hotel-detail',
          'abreu_hotel-detail',
          hotel.hotelId,
        );
      }
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  /**
   * let response: AxiosResponse;
   * const query = ``;
   * const url = this.configService.get(Configuration.BEDS_ONLINE_URL) + query;
   */

  @RabbitSubscribe({
    exchange: 'abreu_hotel-detail',
    routingKey: 'abreu_hotel-detail',
    queue: 'abreu_hotel-detail',
  })
  async subscribeHotelsDetails(hotelId: string): Promise<Nack | undefined> {
    let response: AxiosResponse;
    let hotel: HotelDetailsProvider;

    const request = `
    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
        <soap-env:Header>
            <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                <wsse:Username>${this.username}</wsse:Username>
                <wsse:Password>${this.password}</wsse:Password>
                <Context>${this.context}</Context>
            </wsse:Security>
        </soap-env:Header>
        <soap-env:Body>
            <OTA_HotelInfoRQ xmlns="http://www.opentravel.org/OTA/2003/05/common" LanguageId="${this.language}">
                <HotelRef HotelCode="${hotelId}"/>
            </OTA_HotelInfoRQ>
        </soap-env:Body>
    </soap-env:Envelope>

  `;

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });
    } catch (error) {
      this.HaveError = true;
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );

      throw new HttpException(
        'Abreu - provider error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const json: HotelDetailsProviderResponse = await parser.parse(
      response.data,
      this.options,
    );

    hotel = json.OTA_HotelInfoRS.Hotel.Info;

    if (hotel) {
      const hotelDto = await this.createHotelDetailsAdapter.transform(hotel);
      const newHotel = new this.hotelModel(hotelDto);

      try {
        await this.hotelModel.findOneAndUpdate(
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
            upsert: true,
            new: true,
          },
        );
      } catch (error) {
        // do do - implement log
        this.logger.error('Error saving to database', error);
        this.HaveError = true;
      }
    }

    if (this.HaveError) {
      return new Nack(true);
    }
  }

  async getHotelsDetails() {
    return this.hotelModel.find();
  }

  async getHotelDetail(hotelId: string) {
    return this.hotelModel.findOne({ hotelId });
  }
}
