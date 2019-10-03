import t from 'typy';
import { HotelProvider } from '../intefaces/provider/hotel-provider.interfce';

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

  constructor(originalData: HotelProvider) {
    this.hotelId = String(t(originalData, 'code').safeObject || '');
    this.name = t(originalData, 'name.content').safeObject || '';
    this.zone = String(t(originalData, 'zoneCode').safeObject || '');
    this.address = t(originalData, 'address.content').safeObject || '';
    this.zipCode = t(originalData, 'postalCode').safeObject || '';
    this.latitude = String(
      t(originalData, 'coordinates.latitude').safeObject || '',
    );
    this.longitude = String(
      t(originalData, 'coordinates.longitude').safeObject || '',
    );
    this.hotelCategory = t(originalData, 'categoryCode').safeObject || '';
    this.city = t(originalData, 'city.content').safeObject || '';
  }
}
