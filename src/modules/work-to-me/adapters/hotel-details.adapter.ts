import {
  ServerHotelContentInterface,
  PhoneNumber,
  Feature,
} from '../interfaces/provider/content.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import {
  CreateHotelDetailsDto,
  Phone,
  Facility,
} from '../dto/create-hotel-details.dto';
import path from 'path';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  async transform(originalData: ServerHotelContentInterface) {
    const hotelDetails = new CreateHotelDetailsDto();

    try {
      hotelDetails.hotelId = t(originalData, 'JPCode').safeObject || '';

      hotelDetails.name = t(originalData, 'HotelName').safeObject || '';
      hotelDetails.address =
        t(originalData, 'Address.Address').safeObject || '';

      if (t(originalData, 'Descriptions.Description').isObject) {
        try {
          hotelDetails.description = await this.getDescription(
            t(originalData, 'Descriptions.Description').safeObject || '',
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.description, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.description = '';
      }

      hotelDetails.postalCode =
        t(originalData, 'Address.PostalCode').safeObject || '';

      hotelDetails.location = {
        latitude: t(originalData, 'Address.Latitude').safeObject || '',
        longitude: t(originalData, 'Address.Longitude').safeObject || '',
      };

      if (t(originalData, 'Zone.Name').isString) {
        try {
          hotelDetails.city = await this.getCity(
            t(originalData, 'Zone.Name').safeObject || '',
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.city, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.city = '';
      }

      if (t(originalData, 'Address.Address').isString) {
        try {
          hotelDetails.province = await this.getProvince(
            t(originalData, 'Address.Address').safeObject,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.address, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.province = '';
      }

      if (t(originalData, 'Zone.Name').isString) {
        try {
          hotelDetails.country = await this.getCountry(
            t(originalData, 'Zone.Name').safeObject || '',
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.country, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        // Zone
        hotelDetails.country = '';
      }

      hotelDetails.web = '';

      if (
        t(originalData, 'ContactInfo.PhoneNumbers.PhoneNumber').isString ||
        t(originalData, 'ContactInfo.PhoneNumbers.PhoneNumber').isObject
      ) {
        try {
          hotelDetails.phones = await this.getPhones(
            t(originalData, 'ContactInfo.PhoneNumbers.PhoneNumber')
              .safeObject || '',
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.phones, ${hotelDetails.hotelId}`,
          );
        }
      }

      hotelDetails.email = '';

      hotelDetails.category = {
        name: t(originalData, 'HotelCategory.name').safeObject || '',
        value: t(originalData, 'HotelCategory.Type').safeObject || '',
      };

      // this.photos = t(originalData, 'Images.Image').safeObject || '';

      if (t(originalData, 'Images.Image').isArray) {
        try {
          hotelDetails.photos = await this.getImages(
            t(originalData, 'Images.Image').safeObject,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.image, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.photos = [];
      }

      if (t(originalData, 'Features.Feature').isArray) {
        try {
          hotelDetails.facilities = await this.getFacilities(
            t(originalData, 'Features.Feature').safeObject,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.facilities, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.facilities = [];
      }

      hotelDetails.currency = '';
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + `${hotelDetails.hotelId}`,
      );
    }

    return hotelDetails;
  }

  async getFacilities(facilities: Feature[] | Feature): Promise<Facility[]> {
    const newFacilities = [];

    if (Array.isArray(facilities)) {
      facilities.forEach((el: Feature) => {
        const newFacility: Facility = {
          groupId: el.Type,
          description: el.name,
          id: el.Type,
        };

        newFacilities.push(newFacility);
      });
    } else {
      const newFacility: Facility = {
        groupId: facilities.Type,
        description: facilities.name,
        id: facilities.Type,
      };

      newFacilities.push(newFacility);
    }
    return newFacilities;
  }

  async getDescription(descriptions: any): Promise<string> {
    let description: string = '';

    if (Array.isArray(descriptions)) {
      descriptions.forEach((el: { Type: string; name: string }) => {
        if (el.Type === 'LNG') {
          description += ' ' + el.name;
        }
      });
    } else {
      description = descriptions.name;
    }

    return description;
  }

  async getCity(city: string) {
    return city.split(',')[0];
  }

  async getProvince(address: string) {
    const temp = address.split(',')[1];
    const re = /[0-9]/g;
    let province = '';
    if (temp.match(re)) {
      province = temp.replace(/[0-9]/g, '');
    }

    return province;
  }

  async getCountry(country: string) {
    return country.split(',')[1];
  }

  async getPhones(phones: PhoneNumber[] | PhoneNumber): Promise<Phone[]> {
    const newPhones = [];

    if (Array.isArray(phones)) {
      for (const phone of phones) {
        const newPhone: Phone = {
          number: phone.name,
          info: phone.Type,
        };
        newPhones.push(newPhone);
      }
    } else {
      const newPhone: Phone = {
        number: phones.name,
        info: phones.Type,
      };
      newPhones.push(newPhone);
    }

    return newPhones;
  }

  private async getImages(
    images:
      | Array<{ Type: string; FileName: string; Title: string }>
      | { Type: string; FileName: string; Title: string },
  ) {
    const photos = [];
    if (Array.isArray(images)) {
      images.forEach(
        (img: { Type: string; FileName: string; Title: string }) => {
          const newImg = {
            info: img.Type,
            fileName: img.FileName,
            title: img.Title,
          };

          photos.push(newImg);
        },
      );
    } else {
      const newImg = {
        info: images.Type,
        fileName: images.FileName,
        title: images.Title,
      };
      photos.push(newImg);
    }
    return photos;
  }
}
