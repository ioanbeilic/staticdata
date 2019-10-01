import { ServerHotelContentInterface } from '../interfaces/provider/content.interface';
import t from 'typy';
import { ApiModelProperty } from '@nestjs/swagger';

export class CreateHotelContentDto {
  @ApiModelProperty()
  public hotelId: string;
  @ApiModelProperty()
  public name: string;
  @ApiModelProperty()
  public description: string;
  @ApiModelProperty()
  public location: Location = {
    latitude: '',
    longitude: '',
  };
  @ApiModelProperty()
  public city: string;
  @ApiModelProperty()
  public address: string;
  @ApiModelProperty()
  public province: string;
  @ApiModelProperty()
  public country: string;
  @ApiModelProperty()
  public postalCode: string;
  @ApiModelProperty()
  public web: string;
  @ApiModelProperty()
  public phones: Phone[];
  @ApiModelProperty()
  public email: string;
  @ApiModelProperty()
  public category: Category;
  @ApiModelProperty()
  public photos: Image[];
  @ApiModelProperty()
  public facilities: Facility[];
  @ApiModelProperty()
  public currency: string;

  constructor(originalData: ServerHotelContentInterface) {
    this.hotelId = t(originalData, 'JPCode').safeObject || '';
    this.name = t(originalData, 'HotelName').safeObject || '';
    this.address = t(originalData, 'Address.Address').safeObject || '';
    this.postalCode = t(originalData, 'Address.PostalCode').safeObject || '';

    this.location = {
      latitude: t(originalData, 'Address.Latitude').safeObject || '',
      longitude: t(originalData, 'Address.Longitude').safeObject || '',
    };

    this.description = this.getDescription(
      t(originalData, 'Address.Longitude').safeObject || '',
    );

    this.province = this.getProvince(
      t(originalData, 'Address.Zone.Name').safeObject || '',
    );

    this.city = this.province;
    this.country = this.getCountry(
      t(originalData, 'Address.Zone.Name').safeObject || '',
    );

    this.web = '';

    this.phones = this.getPhones(
      t(originalData, 'ContactInfo.PhoneNumbers').safeObject || '',
    );

    this.email = '';
    this.category = t(originalData, 'HotelCategory').safeObject || '';
    this.photos = t(originalData, 'Images.Image').safeObject || '';
    this.facilities = [];
    this.currency = '';
  }

  getDescription(descriptions: Description[]): string {
    let des: string = '';

    descriptions.forEach(el => {
      if (el.type === 'LNG') {
        des = el.description;
      }
    });
    return des;
  }

  getProvince(city: string) {
    return city.split(',')[0];
  }

  getCountry(city: string) {
    return city.split(',')[1];
  }

  getPhones(phones: Phone[] | Phone): Phone[] {
    const newPhones: Phone[] = [];

    if (Array.isArray(phones)) {
      phones.forEach((phone: Phone) => {
        newPhones.push(phone);
      });
    } else {
      newPhones.push(phones);
    }
    return newPhones;
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
