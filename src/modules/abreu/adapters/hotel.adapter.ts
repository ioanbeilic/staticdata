import t from 'typy';
import { HotelProvider } from '../interfaces/provider/hotel-provider.interfce';
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDto } from '../dto/create-hotel.dto';

Injectable();
export class CreateHotelAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: HotelProvider) {
    const hotel = new CreateHotelDto();
    try {
      hotel.hotelId = String(t(originalData, 'code').safeObject || '');
      hotel.name = t(originalData, 'name.content').safeObject || '';
      hotel.zone = String(t(originalData, 'zoneCode').safeObject || '');
      hotel.address = t(originalData, 'address.content').safeObject || '';
      hotel.zipCode = t(originalData, 'postalCode').safeObject || '';
      hotel.latitude = String(
        t(originalData, 'coordinates.latitude').safeObject || '',
      );
      hotel.longitude = String(
        t(originalData, 'coordinates.longitude').safeObject || '',
      );
      hotel.hotelCategory = t(originalData, 'categoryCode').safeObject || '';
      hotel.city = t(originalData, 'city.content').safeObject || '';
    } catch (error) {
      this.logger.error(error);
    }

    return hotel;
  }
}
