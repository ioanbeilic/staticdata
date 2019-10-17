import { Injectable, HttpException, Inject, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../../../../config/config.service';
import { Configuration } from '../../../../config/config.keys';
import axios, { AxiosResponse } from 'axios';
import * as parser from 'fast-xml-parser';
import fs from 'fs';
import {
  CountryProviderResponse,
  CountryProvider,
} from '../../interfaces/provider/country-provider-response.interface';
import {
  CityProviderResponse,
  CityProvider,
} from '../../interfaces/provider/city-provider-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmqpConnection, RabbitSubscribe, Nack } from '@nestjs-plus/rabbitmq';
import { Hotel } from '../../interfaces/hotel.interface';
import { Logger } from 'winston';
import {
  HotelProviderResponse,
  PropertyResponse,
} from '../../interfaces/provider/hotel-provider-response.interface';
import { CreateHotelAdapter } from '../../adapters/hotel.adapter';
import path from 'path';

@Injectable()
export class HotelService {
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

  constructor(
    private configService: ConfigService,
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('abreu_hotels') private readonly hotelModel: Model<Hotel>,
    @Inject('winston') private readonly logger: Logger,
    private createHotelAdapter: CreateHotelAdapter,
  ) {
    this.context = this.configService.get(Configuration.ABREU_CONTEXT);
    this.password = this.configService.get(Configuration.ABREU_PASSWORD);
    this.username = this.configService.get(Configuration.ABREU_USERNAME);
    this.url = this.configService.get(Configuration.ABREU_URL);
  }

  async getCountry() {
    let response: AxiosResponse;
    let countries: CountryProvider[];

    const request = `
    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header>
      <wsse:Security
        xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
        <wsse:Username>${this.username}</wsse:Username>
        <wsse:Password>${this.password}</wsse:Password>
        <Context>${this.context}</Context>
      </wsse:Security>
    </soap-env:Header>
    <soap-env:Body>
      <OTA_ReadRQ xmlns:ns="http://www.opentravel.org/OTA/2003/05/common"
        xmlns="http://www.opentravel.org/OTA/2003/05" TimeStamp="2015-07-16T06:38:10.60">
        <ReadRequests>
          <HotelReadRequest>
            <TPA_Extensions>
              <RequestType>GetCountries</RequestType>
            </TPA_Extensions>
          </HotelReadRequest>
        </ReadRequests>
      </OTA_ReadRQ>
    </soap-env:Body>
  </soap-env:Envelope>
    `;

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });

      const json: CountryProviderResponse = await parser.parse(
        response.data,
        this.options,
      );
      /*
      fs.writeFile('./counties.json', JSON.stringify(json), (err: any) => {
        if (err) {
          return console.log(err);
        }

        console.log('The file was saved!');
      });
*/
      countries = json.OTA_ReadRS.ReadResponse.Countries.Country;

      for (const country of countries) {
        this.amqpConnection.publish(
          'abreu_country',
          'abreu_country',
          country.CountryISO,
        );
      }
    } catch (error) {
      // console.log(error);
      throw new HttpException('error', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'abreu_country',
    routingKey: 'abreu_country',
    queue: 'abreu_country',
  })
  async hotelsPublisher(countryISO: string) {
    let response: AxiosResponse;
    let cities: CityProvider[] = [];

    const request = `
    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header>
      <wsse:Security
        xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
        <wsse:Username>${this.username}</wsse:Username>
        <wsse:Password>${this.password}</wsse:Password>
        <Context>${this.context}</Context>
      </wsse:Security>
    </soap-env:Header>
    <soap-env:Body>
		<OTA_ReadRQ xmlns:ns="http://www.opentravel.org/OTA/2003/05/common"
			xmlns="http://www.opentravel.org/OTA/2003/05" TimeStamp="2015-07-16T06:38:10.60">
			<ReadRequests>
				<HotelReadRequest>
					<TPA_Extensions>
						<RequestType>GetCities</RequestType>
						<CountryCode>${countryISO}</CountryCode>
					</TPA_Extensions>
				</HotelReadRequest>
			</ReadRequests>
		</OTA_ReadRQ>
	</soap-env:Body>
  </soap-env:Envelope>
    `;

    try {
      response = await axios.post(this.url, request, {
        headers: this.headers,
      });
    } catch (error) {
      // console.log(error);
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw new HttpException('error', error);
    }
    const json: CityProviderResponse = await parser.parse(
      response.data,
      this.options,
    );

    // console.log(JSON.stringify(json));
    cities = cities.concat(json.OTA_ReadRS.ReadResponse.Cities.City);

    if (cities[0] !== undefined && cities.length > 0) {
      for (const city of cities) {
        this.amqpConnection.publish(
          'abreu_hotels',
          'abreu_hotels',
          city.CityCode,
        );
        this.countCityQue++;
      }
    } else {
      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: 'abreu_hotels',
    routingKey: 'abreu_hotels',
    queue: 'abreu_hotels',
  })
  async hotelsSubscriber(cityCode: string) {
    let response: AxiosResponse;
    let hotels: PropertyResponse[] = [];

    this.countHotelQue++;

    const request = `
    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header>
      <wsse:Security
        xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
        <wsse:Username>${this.username}</wsse:Username>
        <wsse:Password>${this.password}</wsse:Password>
        <Context>${this.context}</Context>
      </wsse:Security>
    </soap-env:Header>soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Body>
      <OTA_HotelSearchRQ xmlns:ns="http://www.opentravel.org/OTA/2003/05/common"
        TimeStamp="1973-04-20T11:52:44.81">
        <Criteria>
          <Criterion>
            <HotelRef HotelCityCode="${cityCode}" />
          </Criterion>
        </Criteria>
      </OTA_HotelSearchRQ>
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

    const json: HotelProviderResponse = await parser.parse(
      response.data,
      this.options,
    );

    if (Array.isArray(json.OTA_HotelSearchRS.Properties.Property)) {
      hotels = json.OTA_HotelSearchRS.Properties.Property as PropertyResponse[];
    } else if (json.OTA_HotelSearchRS.Properties.Property) {
      hotels.push(json.OTA_HotelSearchRS.Properties
        .Property as PropertyResponse);
    }

    if (hotels.length > 0) {
      for (const hotel of hotels) {
        const hotelDto = this.createHotelAdapter.transform(hotel);
        const newHotel = new this.hotelModel(hotelDto);

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
          this.logger.error('Error saving to database', error);
          this.HaveError = true;
        }
      }

      // to du automatic init next task
      /**
       * total pages init to 0 and pages init to 1
       * only corresponded the last page
       */

      if (this.countCityQue === this.countHotelQue) {
        // publish-hotels-content
        // console.log('run ');
        const _ = await axios.get(
          `${this.configService.get(
            Configuration.HOST,
          )}/abreu//hotel-details/publish-hotels-content`,
        );
        // console.log(_.status);
        if (_.status === 204) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              JSON.stringify('Obtaining Abreu hotel details'),
          );
        } else {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              JSON.stringify('Error obtains Abreu hotel details'),
          );
        }
      }
    }

    /**
     * check if the current page is the last page
     */

    if (this.HaveError) {
      return new Nack(true);
    }
  }

  async getHotels() {
    try {
      return this.hotelModel.find();
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async getHotel(hotelId: string) {
    try {
      return this.hotelModel.findOne({ hotelId });
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
      throw error;
    }
  }
}
