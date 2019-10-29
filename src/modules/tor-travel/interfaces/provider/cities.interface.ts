import { Document } from 'mongoose';

export interface CityProvider extends Document {
  cityId: string;
  name: string;
  provinceId: string;
  province: string;
  countryId: string;
  country: string;
}
