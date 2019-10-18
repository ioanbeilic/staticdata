import {
  ServerHotelInterface,
  HotelDescriptionsBean,
} from '../interfaces/provider/hotel.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import path from 'path';

@Injectable()
export class CreateHotelAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: HotelDescriptionsBean): CreateHotelDto {
    const hotel = new CreateHotelDto();
    try {
      hotel.hotelId = t(originalData, 'hotelID').safeObject || '';
      hotel.name = t(originalData, 'hotelName').safeObject || '';
      hotel.zone = t(originalData, 'district').safeObject || '';
      hotel.address = t(originalData, 'address').safeObject || '';
      hotel.zipCode = t(originalData, 'postalCode').safeObject || '';
      hotel.latitude = t(originalData, 'latitude').safeObject || '';
      hotel.longitude = t(originalData, 'longitude').safeObject || '';
      hotel.hotelCategory = t(originalData, 'category.nombre').safeObject || '';
      hotel.city = t(originalData, 'city').safeObject || '';
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }

    return hotel;
  }
}
