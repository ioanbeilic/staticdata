import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '../../../../config/config.service';
import { Logger } from 'winston';
import { Configuration } from '../../../../config/config.keys';
import Client from 'ssh2-sftp-client';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import csv from 'csvtojson';
import { AccommodationsService } from '../temporal-data/Accommodations.service';
import { AccommodationsAmenitiesServices } from '../temporal-data/Accommodations_amenities.service';
import { AccommodationsPicturesServices } from '../temporal-data/Accommodations_pictures.service';
import { AccommodationsTypesServices } from '../temporal-data/Accommodations_types_ES.service';
import { AmenitiesService } from '../temporal-data/Amenities_ES.service';
import { CitiesService } from '../temporal-data/Cities_ES.service';
import { RoomService } from '../room/room.service';
import { CreateHotelDetailsAdapter } from '../../adapters/hotel-details.adapter';
import * as iconv from 'iconv-lite';

@Injectable()
export class DownloadService {
  sftp = new Client();
  config: {
    host: string;
    port: number;
    username: string;
    password: string;
  };

  constructor(
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private readonly accommodationsService: AccommodationsService,
    private readonly accommodationsAmenitiesServices: AccommodationsAmenitiesServices,
    private readonly accommodationsPicturesServices: AccommodationsPicturesServices,
    private readonly accommodationsTypesServices: AccommodationsTypesServices,
    private readonly amenitiesService: AmenitiesService,
    private readonly citiesService: CitiesService,
    private readonly roomService: RoomService,
    private readonly createHotelDetailsAdapter: CreateHotelDetailsAdapter,
  ) {
    this.config = {
      host: this.configService.get(Configuration.TOR_TRAVEL_FTP_HOST),
      port: Number(this.configService.get(Configuration.TOR_TRAVEL_FTP_PORT)),
      username: this.configService.get(Configuration.TOR_TRAVEL_FTP_USERNAME),
      password: this.configService.get(Configuration.TOR_TRAVEL_FTP_PASSWORD),
    };
  }

  async getData() {
    try {
      await this.sftp.connect(this.config);

      const list = await this.sftp.list('/');

      for (const el of list) {
        if (
          el.name.indexOf('_ES') > 0 ||
          el.name.indexOf('_pictures') > 0 ||
          el.name.indexOf('_amenities') > 0
        ) {
          // fs.createReadStream('path/to/archive.zip').pipe(unzip.Extract({ path: 'output/path' }));
          const dst = fs.createWriteStream(
            `./tor-travel-files/downloads/${el.name}`,
          ) as any;

          await this.sftp.get('/' + el.name, dst);
        }
      }
      // close connection
      await this.sftp.end();

      const files = fs.readdirSync('./tor-travel-files/downloads/');

      let count = 0;

      for (const filename of files) {
        const file = `./tor-travel-files/downloads/${filename}`;
        const csvName = `./tor-travel-files/csv/${filename.slice(0, -3)}`;
        const fileContent = fs.createReadStream(file);
        fileContent
          .pipe(zlib.createGunzip())
          .pipe(iconv.decodeStream('ISO-8859-1'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream(csvName))
          .on('finish', async (error: Error) => {
            if (error) {
              this.logger.error(
                path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
              );
            } else {
              fs.unlink(file, async err => {
                if (err) {
                  this.logger.error(
                    path.resolve(__filename) + ' ---> ' + JSON.stringify(err),
                  );
                }
              });
            }
            count++;
            if (count === files.length) {
              // await this.createHotelDetailsAdapter.transform();

              await this.cvsToJson();
              await this.createHotelDetailsAdapter.publish();

              this.logger.info(
                path.resolve(__filename) +
                  ' ---> Download Ok -> store to database',
              );
            }
          });
      }
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async cvsToJson() {
    const files = fs.readdirSync('./tor-travel-files/csv/');
    const csvPath = './tor-travel-files/csv/';

    for (const file of files) {
      if (file === 'Accommodations_amenities.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            quote: '"',
            headers: ['hotelId', 'amenityId'],
          }).fromFile(csvPath + file);

          await this.accommodationsAmenitiesServices.saveAccommodationsAmenities(
            jsonData,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Accommodations_amenities ' +
              JSON.stringify(csvPath + file),
          );
        }
      }

      if (file === 'Accommodations_ES.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            quote: '"',
            headers: [
              'hotelId',
              'name',
              'address',
              'postalCode',
              'Giata',
              'cityId',
              'phone',
              'fax',
              'category',
              'accommodationTypeId',
              'latitude',
              'longitude',
              'status',
              'description',
            ],
          }).fromFile(csvPath + file);

          await this.accommodationsService.saveAccommodations(jsonData);
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Accommodations_ES ' +
              JSON.stringify(csvPath + file),
          );
        }
      }
      if (file === 'Accommodations_pictures.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            quote: '"',
            headers: ['hotelId', 'path'],
          }).fromFile(csvPath + file);

          await this.accommodationsPicturesServices.saveAccommodationsPictures(
            jsonData,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Accommodations_pictures ' +
              JSON.stringify(csvPath + file),
          );
        }
      }

      if (file === 'Accommodations_types_ES.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            headers: ['hotelId', 'name'],
          }).fromFile(csvPath + file);

          await this.accommodationsTypesServices.saveAccommodationsTypes(
            jsonData,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              JSON.stringify(csvPath + file),
          );
        }
      }

      if (file === 'Amenities_ES.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            headers: ['amenityId', 'name'],
          }).fromFile(csvPath + file);

          await this.amenitiesService.saveAmenities(jsonData);
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Amenities_ES' +
              JSON.stringify(csvPath + file),
          );
        }
      }

      if (file === 'Cities_ES.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            quote: '"',
            headers: [
              'cityId',
              'name',
              'provinceId',
              'province',
              'countryId',
              'country',
            ],
          }).fromFile(csvPath + file);

          await this.citiesService.saveCities(jsonData);
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Cities_ES' +
              JSON.stringify(csvPath + file),
          );
        }
      }

      if (file === 'Rooms_ES.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            headers: ['hotelId', 'name'],
          }).fromFile(csvPath + file);

          await this.roomService.saveRooms(jsonData);
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> Rooms_ES' +
              JSON.stringify(csvPath + file),
          );
        }
      }
    }
  }
}
