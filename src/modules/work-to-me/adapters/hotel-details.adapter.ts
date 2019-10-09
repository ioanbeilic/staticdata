import { ServerHotelContentInterface } from '../interfaces/provider/content.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDetailsDto } from '../dto/create-hotel-details.dto';
import { Phone } from 'src/modules/beds-online/dto/create-hotel-details.dto';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: ServerHotelContentInterface) {
    const hotelDetails = new CreateHotelDetailsDto();

    try {
      hotelDetails.hotelId = t(originalData, 'JPCode').safeObject || '';

      hotelDetails.name = t(originalData, 'HotelName').safeObject || '';
      hotelDetails.address =
        t(originalData, 'Address.Address').safeObject || '';

      if (t(originalData, 'Descriptions.Description').isObject) {
        hotelDetails.description = this.getDescription(
          t(originalData, 'Descriptions.Description').safeObject || '',
        );
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
        hotelDetails.city = this.getCity(
          t(originalData, 'Zone.Name').safeObject || '',
        );
      } else {
        hotelDetails.city = '';
      }

      if (t(originalData, 'Address.Address').isString) {
        hotelDetails.province = this.getProvince(
          t(originalData, 'Address.Address').safeObject,
        );
      } else {
        hotelDetails.province = '';
      }

      if (t(originalData, 'Zone.Name').isString) {
        hotelDetails.country = this.getCountry(
          t(originalData, 'Zone.Name').safeObject || '',
        );
      } else {
        // Zone
        hotelDetails.country = '';
      }

      hotelDetails.web = '';

      if (
        t(originalData, 'ContactInfo.PhoneNumbers').isString ||
        t(originalData, 'ContactInfo.PhoneNumbers').isObject
      ) {
        hotelDetails.phones = this.getPhones(
          t(originalData, 'ContactInfo.PhoneNumbers').safeObject || '',
        );
      }

      hotelDetails.email = '';

      hotelDetails.category = {
        name: t(originalData, 'HotelCategory.name').safeObject || '',
        value: t(originalData, 'HotelCategory.Type').safeObject || '',
      };

      // this.photos = t(originalData, 'Images.Image').safeObject || '';

      if (t(originalData, 'Images.Image').isArray) {
        hotelDetails.photos = this.getImages(
          t(originalData, 'Images.Image').safeObject,
        );
      } else {
        hotelDetails.photos = [];
      }

      hotelDetails.facilities = [];
      hotelDetails.currency = '';
    } catch (error) {
      this.logger.error(error);
    }
    return hotelDetails;
  }

  private getDescription(descriptions: any): string {
    let description: string = '';

    if (Array.isArray(descriptions)) {
      descriptions.forEach((el: { Type: string; name: string }) => {
        if (el.Type === 'LNG') {
          description = el.name;
        }
      });
    } else {
      description = descriptions.name;
    }

    return description;
  }

  private getCity(city: string) {
    return city.split(',')[0];
  }

  private getProvince(address: string) {
    const temp = address.split(',')[1];
    const re = /[0-9]/g;
    let province = '';
    if (temp.match(re)) {
      province = temp.replace(/[0-9]/g, '');
    }

    return province;
  }

  private getCountry(country: string) {
    return country.split(',')[1];
  }

  private getPhones(phones: Phone[] | Phone): Phone[] {
    const newPhones = [];
    if (Array.isArray(phones)) {
      phones.forEach((phone: Phone) => {
        newPhones.push(phone);
      });
    } else {
      newPhones.push(phones);
    }

    return newPhones;
  }

  private getImages(
    images:
      | Array<{ Type: string; FileName: string; Title: string }>
      | { Type: string; FileName: string; Title: string },
  ) {
    const photos = [];
    if (Array.isArray(images)) {
      images.forEach(
        (img: { Type: string; FileName: string; Title: string }) => {
          const newImg = {
            type: img.Type,
            fileName: img.FileName,
            title: img.Title,
          };

          photos.push(newImg);
        },
      );
    } else {
      const newImg = {
        type: images.Type,
        fileName: images.FileName,
        title: images.Title,
      };
      photos.push(newImg);
    }
    return photos;
  }
}
