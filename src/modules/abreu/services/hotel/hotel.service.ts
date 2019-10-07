import { Injectable, HttpException } from '@nestjs/common';
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
  countries!: CountryProvider[] | undefined;
  cities: CityProvider[] | undefined;

  constructor(private configService: ConfigService) {
    this.context = this.configService.get(Configuration.ABREU_CONTEXT);
    this.password = this.configService.get(Configuration.ABREU_PASSWORD);
    this.username = this.configService.get(Configuration.ABREU_USERNAME);
    this.url = this.configService.get(Configuration.ABREU_URL);

    this.getCountry();
  }

  async getCountry() {
    let response: AxiosResponse;
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
      this.countries = json.OTA_ReadRS.ReadResponse.Countries;
    } catch (error) {
      // console.log(error);
      throw new HttpException('error', error);
    }
  }

  async getCity(countryISO: string) {
    let response: AxiosResponse;
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

      const json: CityProviderResponse = await parser.parse(
        response.data,
        this.options,
      );
      /*
      fs.writeFile('./cities.json', JSON.stringify(json), (err: any) => {
        if (err) {
          return console.log(err);
        }

        console.log('The file was saved!');
      });
*/
      this.cities = json.OTA_ReadRS.ReadResponse.Cities;
    } catch (error) {
      // console.log(error);
      throw new HttpException('error', error);
    }
  }

  // async publishHotels(): Promise<void> {}

  validator = async (response: string): Promise<boolean> => {
    const re = new RegExp('\b(w*[Ee][Rr][Rr][Oo][Rr]w*)\b');
    return re.test(response.slice(0, 10000));
  } // prettier-ignore
}
