import { ServerHotelInterface } from '../interfaces/work-to-me/provider/hotel.interface';
import t from 'typy';

export class CreateHotelDto {
  hotelId: string;
  name: string;
  zone: string;
  address: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  hotelCategory: string;
  city: string;

  constructor(originalData: ServerHotelInterface) {
    this.address = t(originalData, 'Adress.Adress').safeObject || '';

    this.hotelId = originalData.JPCode ? originalData.JPCode : '';
    this.name = originalData.Name ? originalData.Name : '';
    this.zone = originalData.Zone.Name ? originalData.Zone.Name : '';
    this.address = originalData.Address ? originalData.Address : '';
    this.zipCode = originalData.ZipCode ? originalData.ZipCode : '';
    this.latitude = originalData.Latitude ? originalData.Latitude : 0;
    this.longitude = originalData.Longitude ? originalData.Longitude : 0;
    this.hotelCategory = originalData.HotelCategory
      ? originalData.HotelCategory.name
      : '';
    this.city = originalData.City ? originalData.City.name : '';
  }
}
