import { ServerHotelInterface } from '../interfaces/provider/hotel.interface';
import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import path from 'path';

@Injectable()
export class CreateHotelAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  transform(originalData: ServerHotelInterface[]): CreateHotelDto {
    const hotel = new CreateHotelDto();
    try {
      hotel.hotelId = t(originalData, 'JPCode').safeObject || '';
      hotel.name = t(originalData, 'Name').safeObject || '';
      hotel.zone = t(originalData, 'Zone.Name').safeObject || '';
      hotel.address = t(originalData, 'Zone.Address').safeObject || '';
      hotel.zipCode = t(originalData, 'ZipCode').safeObject || '';
      hotel.latitude = t(originalData, 'Latitude').safeObject || '';
      hotel.longitude = t(originalData, 'Longitude').safeObject || '';
      hotel.hotelCategory =
        t(originalData, 'HotelCategory.name').safeObject || '';
      hotel.city = t(originalData, 'HotelCategory.City').safeObject || '';
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }

    return hotel;
  }
}
