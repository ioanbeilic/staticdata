import { Document } from 'mongoose';

export interface CityProvider extends Document {
  ID: string;
  Name: string;
  'Province/region/state ID': string;
  'Province/region/state Name': string;
  'Country ID': string;
  'Country Name': string;
}
