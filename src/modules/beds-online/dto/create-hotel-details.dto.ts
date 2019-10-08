import {
  HotelDetailsProvider,
  ImageProvider,
  FacilityProvider,
} from '../interfaces/provider/hotel-details-provider.interface';
import t from 'typy';

export class CreateHotelDetailsDto {
  public hotelId!: string;
  public name!: string;
  public description!: string;
  public location: Location = {
    latitude: '',
    longitude: '',
  };
  public city!: string;
  public address!: string;
  public province!: string;
  public country!: string;
  public postalCode!: string;
  public web!: string;
  public phones: Phone[] = [];
  public email!: string;
  public category!: Category;
  public photos: Image[] = [];
  public facilities: Facility[] = [];
  public currency!: string;

  constructor(originalData: HotelDetailsProvider) {
    try {

      this.hotelId = String(t(originalData, 'code').safeObject || '');

      this.name = t(originalData, 'name.content').safeObject || '';
      this.description = t(originalData, 'description.content').safeObject || '';
      this.country =
        t(originalData, 'country.description.content').safeObject || '';
      this.province = t(originalData, 'state.name').safeObject || '';
      this.location = {
        latitude:
          String(t(originalData, 'coordinates.latitude').safeObject) || '',
        longitude:
          String(t(originalData, 'coordinates.longitude').safeObject) || '',
      };
      this.address = t(originalData, 'address.content').safeObject || '';
      this.postalCode = t(originalData, 'postalCode').safeObject || '';
      this.city = t(originalData, 'city.content').safeObject || '';

      this.web = t(originalData, 'web').safeObject || '';

      this.phones = t(originalData, 'phones').safeObject || '';
      this.email = t(originalData, 'email').safeObject || '';

      this.category = {
        name: t(originalData, 'category.description.content').safeObject || '',
        value: t(originalData, 'category.description.code').safeObject || '',
      };

      if (t(originalData, 'images').isArray) {
        this.getImages(t(originalData, 'images').safeObject);
      } else {
        this.photos = [];
      }

      if (t(originalData, 'facilities').isArray) {
        this.getImages(t(originalData, 'facilities').safeObject);
      } else {
        this.facilities = [];
      }

      this.currency = '';
    } catch (error) {
      // console.log(error)
    }
  }

  getImages(images: ImageProvider[]) {
    if (Array.isArray(images)) {
      images.forEach(img => {
        const newImg = {
          type: img.type.code,
          fileName: img.path,
          title: img.type.description.content,
        };

        this.photos.push(newImg);
      });
    }
  }

  getFacilities(facilities: FacilityProvider[]) {
    console.log(Array.isArray(facilities))
    if (Array.isArray(facilities)) {
      facilities.forEach(facility => {
        const newFacility = {
          id: facility.facilityCode,
          description: facility.description.content,
          groupId: facility.facilityGroupCode,
        };

        this.facilities.push(newFacility);
      });
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
