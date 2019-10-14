import { ServerHotelInterface } from '../interfaces/provider/hotel.interface';
import t from 'typy';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

export class CreateHotelDto {
  hotelId!: string;
  name!: string;
  zone!: string;
  address!: string;
  zipCode!: string;
  latitude!: string;
  longitude!: string;
  hotelCategory!: string;
  city!: string;
}
