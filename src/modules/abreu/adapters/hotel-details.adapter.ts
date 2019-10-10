import path from 'path';
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import {
  HotelDetailsProvider,
  ImageProvider,
  Descriptive,
} from '../interfaces/provider/hotel-details-response.interface';
import { CreateHotelDetailsDto } from '../dto/create-hotel-content.dto';
import t from 'typy';
import { Image } from '../interfaces/hotel-details.interface';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: HotelDetailsProvider) {
    const hotelDetails = new CreateHotelDetailsDto();

    hotelDetails.hotelId = String(
      t(originalData, 'HotelCode').safeObject || '',
    );

    hotelDetails.name = t(originalData, 'HotelName').safeObject || '';

    if (t(originalData, 'Descriptions.Descriptive.Text.__cdata').isArray) {
      hotelDetails.description = this.getDescription(
        t(originalData, 'Descriptions.Descriptive.Text.__cdata').safeObject,
      );
    } else {
      hotelDetails.description =
        t(originalData, 'Descriptions.Descriptive.Text.__cdata').safeObject ||
        '';
    }

    hotelDetails.country =
      t(originalData, 'Address.CountryName').safeObject || '';

    hotelDetails.province = t(originalData, 'state.name').safeObject || '';

    hotelDetails.location = {
      latitude: String(t(originalData, 'Position.Lat').safeObject) || '',
      longitude: String(t(originalData, 'Position.Lon').safeObject) || '',
    };
    hotelDetails.address =
      t(originalData, 'Address.AddressLine.__cdata').safeObject || '';

    hotelDetails.postalCode =
      t(originalData, 'Address.PostalCode').safeObject || '';

    hotelDetails.city = t(originalData, 'Address.CityName').safeObject || '';

    hotelDetails.web = t(originalData, 'Contacts.Website').safeObject || '';

    hotelDetails.phones = t(originalData, 'Contacts.Phone').safeObject || '';
    hotelDetails.email = t(originalData, 'Contacts.Email').safeObject || '';

    hotelDetails.category = {
      name: '',
      value: '',
    };

    if (t(originalData, 'Images.Image').isArray) {
      try {
        hotelDetails.photos = this.getImages(
          t(originalData, 'Images.Image').safeObject,
        );
      } catch (error) {
        this.logger.error(
          path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
        );
      }
    } else {
      hotelDetails.photos = [];
    }

    hotelDetails.facilities = [];
    hotelDetails.currency = '';

    return hotelDetails;
  }

  private getImages(images: ImageProvider[]) {
    const photos: Image[] = [];

    images.forEach(img => {
      const newImg = {
        type: img.Category,
        fileName: img.URL,
        title: img.Category,
      };

      photos.push(newImg);
    });

    return photos;
  }

  private getDescription(descriptions: Descriptive[]) {
    const description = descriptions.filter(el => el.Type === 'General');
    return description[0].Text.__cdata;
  }
}
