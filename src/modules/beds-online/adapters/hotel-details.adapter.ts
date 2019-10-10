import {
  HotelDetailsProvider,
  ImageProvider,
  FacilityProvider,
} from '../interfaces/provider/hotel-details-provider.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import {
  CreateHotelDetailsDto,
  Image,
  Facility,
} from '../dto/create-hotel-details.dto';
import path from 'path';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: HotelDetailsProvider) {
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
    hotelDetails.email = t(originalData, 'email').safeObject || '';

    hotelDetails.category = {
      name: t(originalData, 'category.description.content').safeObject || '',
      value: t(originalData, 'category.description.code').safeObject || '',
    };

    if (t(originalData, 'images').isArray) {
      try {
        hotelDetails.photos = this.getImages(
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
        hotelDetails.facilities = this.getFacilities(
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
  }

  private getImages(images: ImageProvider[]) {
    const photos: Image[] = [];

    images.forEach(img => {
      const newImg = {
        type: img.type.code,
        fileName: img.path,
        title: img.type.description.content,
      };

      photos.push(newImg);
    });

    return photos;
  }

  private getFacilities(facilities: FacilityProvider[]) {
    const newFacilities: Facility[] = [];

    facilities.forEach(facility => {
      const newFacility = {
        id: facility.facilityCode,
        description: facility.description.content,
        groupId: facility.facilityGroupCode,
      };

      newFacilities.push(newFacility);
    });
    return newFacilities;
  }
}
