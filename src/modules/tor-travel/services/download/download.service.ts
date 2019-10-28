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
import { HotelDetailsService } from '../hotel-details/hotel-details.service';

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
    private readonly hotelDetailsService: HotelDetailsService,
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

    for (const file of files) {
      if (file === 'Accommodations_amenities.csv') {
        try {
          const jsonData = await csv({
            noheader: false,
            delimiter: '|',
            quote: '"',
            headers: ['ID Hotel', 'ID Amenity'],
          }).fromFile(file);

          this.accommodationsAmenitiesServices.saveAccommodationsAmenities(
            jsonData,
          );
        } catch (error) {
          console.log(error);
        }
      }
      if (file === 'Accommodations_ES.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          quote: '"',
          headers: [
            'ID',
            'Name',
            'Address',
            'Zip',
            'Giata',
            'City ID',
            'Phone',
            'Fax',
            'Category',
            'Accommodation Type ID',
            'Latitude',
            'Longitude',
            'Status',
            'Description',
          ],
        }).fromFile(file);

        this.accommodationsService.saveAccommodations(jsonData);
      }
      if (file === 'Accommodations_pictures.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          quote: '"',
          headers: ['Hotel ID', 'Picture path'],
        }).fromFile(file);

        this.accommodationsPicturesServices.saveAccommodationsPictures(
          jsonData,
        );
      }
      if (file === 'Accommodations_types_ES.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          headers: ['ID', 'Name'],
        }).fromFile(file);

        this.accommodationsTypesServices.saveAccommodationsTypes(jsonData);
      }
      if (file === 'Amenities_ES.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          headers: ['ID', 'Name'],
        }).fromFile(file);

        this.amenitiesService.saveAmenities(jsonData);
      }

      if (file === 'Cities_ES.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          quote: '"',
          headers: [
            'ID',
            'Name',
            'Province/region/state ID',
            'Province/region/state Name',
            'Country ID',
            'Country Name',
          ],
        }).fromFile(file);

        this.citiesService.saveCities(jsonData);
      }

      if (file === 'Rooms_ES.csv') {
        const jsonData = await csv({
          noheader: false,
          delimiter: '|',
          headers: ['hotelId', 'name'],
        }).fromFile(file);

        this.hotelDetailsService.saveRooms(jsonData);
      }
    }
  }
}
