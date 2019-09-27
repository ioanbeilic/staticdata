import { ServerHotelContentInterface } from '../interfaces/work-to-me/provider/content.interface';
import t from 'typy';
/*
export class Hotel {
  public hotelId: string;
  public name: string;
  public description: string;
  public location: Location;
  public city: string;
  public address: string;
  public province: string;
  public country: string;
  public postalCode: string;
  public web: string;
  public phones: Phone[];
  public email: string;
  public category: Category;
  public photos: string[];
  public facilities: Facility[];
  public currency: string;
  // public providers?: HotelProvider[]; --  ?? a ver si lo añadimos
  // public hotelGetReq: HotelGetReqDto;
 constructor(originalData: ServerHotelContentInterface) {
    this.hotelId = originalData.JPCode ? originalData.JPCode : '';
    this.name = originalData.HotelName ? originalData.HotelName : '';
    this.address = t(originalData, 'Adress.Adress').safeObject || ''
   // this.description = t(originalDat, '');
    this.address = originalData.Address ? originalData.Address.Address : '' ;

    this.postalCode =  originalData.Address. ? originalData.Address.PostalCode : '';
  this.location = {
      latitude: originalData.Address.Latitude ? originalData.Address.Latitude : '',
      longitude: originalData.Address.Longitude ? originalData.Address.Longitude : ''
    };
  this.phoneNumber = {
      name : originalData.ContactInfo.PhoneNumbers.PhoneNumber.name ? originalData.Address.Address : '',
      type : originalData.ContactInfo.PhoneNumbers.PhoneNumber.Type ? originalData.Address.Address : '',
    }
    this.hotelCategory = {
      name: originalData.HotelCategory.name ? originalData.HotelCategory.name: '',
      type: originalData.HotelCategory.Type ? originalData.HotelCategory.Type : '',
    };

    originalData.Images.Image.forEach(el => {

      const image: Image = {
        fileName: el.FileName,
        title: el.Title,
        type: el. Type
      }

      this.images.push(image)
    });

    };

    this.latitude = originalData.Latitude ? originalData.Latitude : 0;
    this.longitude = originalData.Longitude ? originalData.Longitude : 0;
    this.hotelCategory = originalData.HotelCategory
      ? originalData.HotelCategory.name
      : '';
    this.city = originalData.City ? originalData.City.name : '';
  }
}

export interface Phone {
  number: string;
  type: string;
}

export interface Category {
  name: string;
  value: string;
}

export interface Location {
  latitude: string;
  longitude: string;
}
*/
