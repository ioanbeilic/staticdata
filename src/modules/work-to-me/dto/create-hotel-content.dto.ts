import { ServerHotelContentInterface } from '../interfaces/provider/content.interface';
import t from 'typy';

export class CreateHotelContentDto {
  public hotelId: string;
  public name: string;
  public description!: string;
  public location: Location = {
    latitude: '',
    longitude: '',
  };
  public city: string;
  public address: string;
  public province: string;
  public country: string;
  public postalCode: string;
  public web: string;
  public phones: Phone[] = [];
  public email: string;
  public category: Category;
  public photos: Image[];
  public facilities: Facility[];
  public currency: string;

  constructor(originalData: ServerHotelContentInterface) {
    this.hotelId = t(originalData, 'JPCode').safeObject || '';
    this.name = t(originalData, 'HotelName').safeObject || '';
    this.address = t(originalData, 'Address.Address').safeObject || '';

    if (t(originalData, 'Descriptions.Description').isObject) {
      this.getDescription(
        t(originalData, 'Descriptions.Description').safeObject || '',
      );
    } else {
      this.description = '';
    }
    /*
    console.log(
      this.hotelId,
      this.name,
      this.address,
      this.description,
      //this.location,
      //this.city,
      //this.province,
      //this.country,
      //this.postalCode,
      //this.web,
      //this.phones,
      //this.email,
      //this.category,
      //this.photos,
      //this.facilities,
      //this.currency,
    );
*/
    this.postalCode = t(originalData, 'Address.PostalCode').safeObject || '';

    this.location = {
      latitude: t(originalData, 'Address.Latitude').safeObject || '',
      longitude: t(originalData, 'Address.Longitude').safeObject || '',
    };

    if (t(originalData, 'Address.Zone.Name').isString) {
      this.province = this.getProvince(
        t(originalData, 'Address.Zone.Name').safeObject || '',
      );
      this.city = this.province;
    } else {
      this.province = '';
      this.city = '';
    }

    if (t(originalData, 'Address.Zone.Name').isString) {
      this.country = this.getCountry(
        t(originalData, 'Address.Zone.Name').safeObject || '',
      );
    } else {
      this.country = '';
    }

    this.web = '';

    if (
      t(originalData, 'ContactInfo.PhoneNumbers').isString ||
      t(originalData, 'ContactInfo.PhoneNumbers').isObject
    ) {
      this.getPhones(
        t(originalData, 'ContactInfo.PhoneNumbers').safeObject || '',
      );
    }

    this.email = '';
    this.category = t(originalData, 'HotelCategory').safeObject || '';
    this.photos = t(originalData, 'Images.Image').safeObject || '';
    this.facilities = [];
    this.currency = '';
  }

  getDescription(descriptions: any): void {
    if (Array.isArray(descriptions)) {
      descriptions.forEach((el: { Type: string; name: string }) => {
        if (el.Type === 'LNG') {
          this.description = el.name;
        }
      });
    } else {
      this.description = descriptions.name;
    }
  }

  getProvince(city: string) {
    return city.split(',')[0];
  }

  getCountry(city: string) {
    return city.split(',')[1];
  }

  getPhones(phones: Phone[] | Phone): void {
    if (Array.isArray(phones)) {
      phones.forEach((phone: Phone) => {
        this.phones.push(phone);
      });
    } else {
      this.phones.push(phones);
    }
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

export interface Description {
  description: string;
  type: string;
}

export interface Image {
  type: string;
  fileName: string;
  title: string;
}

export interface Facility {
  id: number;
  description: string;
  groupId: number;
}
