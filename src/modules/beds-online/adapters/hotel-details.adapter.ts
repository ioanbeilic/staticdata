import {
  HotelDetailsProvider,
  ImageProvider,
  FacilityProvider,
  PhoneProvider,
} from '../interfaces/provider/hotel-details-provider.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import {
  CreateHotelDetailsDto,
  Image,
  Facility,
  Phone,
} from '../dto/create-hotel-details.dto';
import path from 'path';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  async transform(originalData: HotelDetailsProvider) {
    const hotelDetails = new CreateHotelDetailsDto();

    hotelDetails.hotelId = String(t(originalData, 'code').safeObject || '');

    hotelDetails.name = t(originalData, 'name.content').safeObject || '';
    hotelDetails.description =
      t(originalData, 'description.content').safeObject || '';
    hotelDetails.country =
      t(originalData, 'country.description.content').safeObject || '';
    hotelDetails.province = t(originalData, 'state.name').safeObject || '';
    hotelDetails.location = {
      latitude:
        String(t(originalData, 'coordinates.latitude').safeObject) || '',
      longitude:
        String(t(originalData, 'coordinates.longitude').safeObject) || '',
    };
    hotelDetails.address = t(originalData, 'address.content').safeObject || '';
    hotelDetails.postalCode = t(originalData, 'postalCode').safeObject || '';
    hotelDetails.city = t(originalData, 'city.content').safeObject || '';

    hotelDetails.web = t(originalData, 'web').safeObject || '';

    hotelDetails.phones = t(originalData, 'phones').safeObject || '';

    if (t(originalData, 'phones').isArray) {
      try {
        hotelDetails.phones = await this.getPhones(
          t(originalData, 'phones').safeObject,
        );
      } catch (error) {
        this.logger.error(
          path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
        );
      }
    } else {
      hotelDetails.phones = [];
    }

    hotelDetails.email = t(originalData, 'email').safeObject || '';

    hotelDetails.category = {
      name: t(originalData, 'category.description.content').safeObject || '',
      value: t(originalData, 'category.description.code').safeObject || '',
    };

    if (t(originalData, 'images').isArray) {
      try {
        hotelDetails.photos = await this.getImages(
          t(originalData, 'images').safeObject,
        );
      } catch (error) {
        this.logger.error(
          path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
        );
      }
    } else {
      hotelDetails.photos = [];
    }

    if (t(originalData, 'facilities').isArray) {
      try {
        hotelDetails.facilities = await this.getFacilities(
          t(originalData, 'facilities').safeObject,
        );
      } catch (error) {
        this.logger.error(
          path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
        );
      }
    } else {
      hotelDetails.facilities = [];
    }

    hotelDetails.currency = '';

    return hotelDetails;
  }

  private async getImages(images: ImageProvider[]): Promise<Image[]> {
    const photos: Image[] = [];

    for (const img of images) {
      const newImg = await {
        info: img.type.code,
        fileName: img.path,
        title: img.type.description.content,
      };

      photos.push(newImg);
    }

    return photos;
  }

  private async getFacilities(
    facilities: FacilityProvider[],
  ): Promise<Facility[]> {
    const newFacilities: Facility[] = [];

    for (const facility of facilities) {
      const newFacility = {
        id: facility.facilityCode,
        description: facility.description.content,
        groupId: facility.facilityGroupCode,
      };

      newFacilities.push(newFacility);
    }

    return newFacilities;
  }

  private async getPhones(phones: PhoneProvider[]): Promise<Phone[]> {
    const newPhones: Phone[] = [];

    for (const phone of phones) {
      const newPhone = {
        number: phone.phoneNumber,
        info: phone.phoneType,
      };

      newPhones.push(newPhone);
    }

    return newPhones;
  }
}
