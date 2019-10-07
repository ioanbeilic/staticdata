/*
import { ServerHotelInterface } from '../interfaces/provider/hotel.interface';
import t from 'typy';

export class CreateHotelDto {
  hotelId: string;
  name: string;
  zone: string;
  address: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  hotelCategory: string;
  city: string;

  constructor(originalData: ServerHotelInterface) {
    this.hotelId = t(originalData, 'JPCode').safeObject || '';
    this.name = t(originalData, 'Name').safeObject || '';
    this.zone = t(originalData, 'Zone.Name').safeObject || '';
    this.address = t(originalData, 'Zone.Address').safeObject || '';
    this.zipCode = t(originalData, 'ZipCode').safeObject || '';
    this.latitude = t(originalData, 'Latitude').safeObject || '';
    this.longitude = t(originalData, 'Longitude').safeObject || '';
    this.hotelCategory = t(originalData, 'HotelCategory.name').safeObject || '';
    this.city = t(originalData, 'HotelCategory.City').safeObject || '';
  }
}
*/
