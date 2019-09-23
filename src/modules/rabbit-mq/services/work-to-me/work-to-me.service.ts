import { Injectable, HttpService } from '@nestjs/common';
import * as parser from 'fast-xml-parser';
import he from 'he';
import fs from 'fs';

@Injectable()
export class WorkToMeService {
  version = '1.1';
  language = 'en';
  pass = 'gw7yx6qU';
  login = 'XMLTestCandamena';

  options = {
    attributeNamePrefix: '',
    attrNodeName: '', // default is 'false'
    // textNodeName: '#text',
    ignoreAttributes: false, // def true
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true, // def fault
    trimValues: true,
    cdataTagName: '__cdata', // default is 'false'
    cdataPositionChar: '\\c',
    localeRange: '', // To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
    mergeAttrs: true,
    attrValueProcessor: (a: any) => he.decode(a, { isAttributeValue: true }), // default is a=>a
    tagValueProcessor: (a: any) => he.decode(a), // default is a=>a
  };

  request = `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns="http://www.juniper.es/webservice/2007/">
        <soapenv:Header/>
        <soapenv:Body>
            <HotelPortfolio>
                <HotelPortfolioRQ Version="${this.version}" Language="${this.language}$" Page="10" RecordsPerPage="100">
                    <Login Password="${this.pass}" Email="${this.login}"/>
                </HotelPortfolioRQ>
            </HotelPortfolio>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

  constructor(private readonly http: HttpService) {}

  async getHotels(): Promise<any> {
    const data = this.http.post(
      'https://xml-uat.bookingengine.es/WebService/JP/Operations/StaticDataTransactions.asmx?WSDL',
      this.request,
      {
        headers: {
          'Content-Type': 'text/xml',
          'Accept-Encoding': 'gzip, deflate',
        },
      },
    );

    data.subscribe(async _ => {
      const json = parser.parse(_.data, this.options);

      fs.writeFile('./revived.json', JSON.stringify(json), err => {
        if (err) {
          return console.log(err); // tslint:disable-line
        }

        console.log('The file was saved!'); // tslint:disable-line
      });
    });
  }
}
