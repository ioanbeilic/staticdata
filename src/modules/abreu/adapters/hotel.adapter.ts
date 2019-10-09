import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { PropertyResponse } from '../interfaces/provider/hotel-provider-response.interface';

@Injectable()
export class CreateHotelAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: PropertyResponse): CreateHotelDto {
    const hotel = new CreateHotelDto();
    try {
      hotel.hotelId = t(originalData, 'HotelCode').safeObject || '';
      hotel.name = t(originalData, 'HotelName').safeObject || '';
      hotel.zone = '';
      hotel.address =
        t(originalData, 'Address.Address.__cdata').safeObject || '';
      hotel.zipCode = t(originalData, 'Address.PostalCode').safeObject || '';
      hotel.latitude = t(originalData, 'Position.Latitude').safeObject || '';
      hotel.longitude = t(originalData, 'Position.Longitude').safeObject || '';
      hotel.hotelCategory = '';
      hotel.city = t(originalData, 'Address.CityName').safeObject || '';
    } catch (error) {
      this.logger.error('Error transforming data - Abreu');
    }
    return hotel;
  }
}
