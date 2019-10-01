import { Injectable } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import { ServerHotelInterface } from '../../interfaces/work-to-me/provider/hotel.interface';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../../interfaces/hotel.interface';
import axios from 'axios';
import { ServerContentResponse } from '../../interfaces/work-to-me/provider/server-content-response.interface';
import { HotelService } from './hotel.service';
import { HotelContent } from '../../interfaces/hotel-content.interface';
import { CreateHotelContentDto } from '../../dto/create-hotel-content.dto';
import { ServerHotelContentInterface } from '../../interfaces/work-to-me/provider/content.interface';

@Injectable()
export class HotelContentService {
  version = '1.1';
  language = 'en';
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

  request = `
    <soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns="http://www.juniper.es/webservice/2007/">
    <soapenv:Header/>
    <soapenv:Body>
        <HotelContent>
            <HotelContentRQ Version="${this.version}" Language="${this.language}">
                <Login Password="${this.pass}" Email="${this.login}"/>
                <HotelContentList>
                    <Hotel Code="${this.hotelId}"/>
                </HotelContentList>
            </HotelContentRQ>
        </HotelContent>
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
  hotelContent!: ServerHotelContentInterface;

  constructor(
    private readonly hotelService: HotelService,
    private readonly amqpConnection: AmqpConnection,
    @InjectModel('hotelContent')
    private readonly hotelContentModel: Model<HotelContent>,
  ) {}

  async publishALlhHotelContent() {
    const hotels = await this.hotelService.getHotels();
    hotels.forEach((hotel: Hotel) => {
      this.amqpConnection.publish('workToMe', 'hotelsContent', hotel.hotelId);
    });
  }

  async publishHotelContent(hotelId: string) {
    this.amqpConnection.publish('workToMe', 'hotelsContent', hotelId);
  }

  @RabbitSubscribe({
    exchange: 'workToMe',
    routingKey: 'hotelsContent',
    queue: 'hotelsContent',
  })
  async HotelContent(hotelId: string): Promise<Nack | undefined> {
    this.hotelId = hotelId;
    let response;

    try {
      response = await axios.post(this.url, this.request, {
        headers: this.headers,
      });
    } catch (error) {
      this.HaveError = true;
      throw error;
    }

    const json: ServerContentResponse = await parser.parse(
      response.data,
      this.options,
    );

    this.hotelContent =
      json.Envelope.Body.HotelContentResponse.ContentRS.Contents;

    if (this.hotelContent) {
      const createHotelContent = new CreateHotelContentDto(this.hotelContent);
      const newHotel = new this.hotelContentModel(createHotelContent);

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
        this.HaveError = true;
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

  Validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
  }; // tslint:disable-line
}
