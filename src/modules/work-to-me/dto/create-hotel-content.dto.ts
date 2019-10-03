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
  public province!: string;
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

    this.postalCode = t(originalData, 'Address.PostalCode').safeObject || '';

    this.location = {
      latitude: t(originalData, 'Address.Latitude').safeObject || '',
      longitude: t(originalData, 'Address.Longitude').safeObject || '',
    };

    if (t(originalData, 'Zone.Name').isString) {
      this.city = this.getCity(t(originalData, 'Zone.Name').safeObject || '');
    } else {
      this.city = '';
    }

    if (t(originalData, 'Address.Address').isString) {
      this.province = this.getProvince(
        t(originalData, 'Address.Address').safeObject,
      );
    } else {
      this.province = '';
    }

    if (t(originalData, 'Zone.Name').isString) {
      this.country = this.getCountry(
        t(originalData, 'Zone.Name').safeObject || '',
      );
    } else {
      // Zone
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

    this.category = {
      name: t(originalData, 'HotelCategory.name').safeObject || '',
      value: t(originalData, 'HotelCategory.Type').safeObject || '',
    };

    // this.photos = t(originalData, 'Images.Image').safeObject || '';

    if (t(originalData, 'Images.Image').isArray) {
      this.photos = this.getImages(t(originalData, 'Images.Image').safeObject);
    } else {
      this.photos = [];
    }

    this.facilities = [];
    this.currency = '';
    /*
    console.log(
      this.hotelId,
      this.name,
      this.address,
      this.description,
      this.postalCode,
      this.location,
      this.city,
      this.province,
      this.country,
      this.category,
      this.web,
      this.phones,
      this.email,
      this.photos,
      this.facilities,
      this.currency,
    );
    */
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

  getCity(city: string) {
    return city.split(',')[0];
  }

  getProvince(address: string) {
    let temp = address.split(',')[1];
    const re = /[0-9]/g;
    let province = '';
    if (temp.match(re)) {
      province = temp.replace(/[0-9]/g, '');
    }

    return province;
  }

  getCountry(country: string) {
    return country.split(',')[1];
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

  getImages(
    images:
      | { Type: string; FileName: string; Title: string }[]
      | { Type: string; FileName: string; Title: string },
  ) {
    const photos = [];
    if (Array.isArray(images)) {
      images.forEach(
        (img: { Type: string; FileName: string; Title: string }) => {
          let newImg = {
            type: img.Type,
            fileName: img.FileName,
            title: img.Title,
          };

          photos.push(newImg);
        },
      );
    } else {
      let newImg = {
        type: images.Type,
        fileName: images.FileName,
        title: images.Title,
      };
      photos.push(newImg);
    }
    return photos;
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
