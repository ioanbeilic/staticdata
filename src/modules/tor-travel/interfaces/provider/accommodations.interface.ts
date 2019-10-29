import { Document } from 'mongoose';

export interface Accommodations extends Document {
  hotelId: string;
  name: string;
  address: string;
  postalCode: string;
  Giata: string;
  cityId: string;
  phone: string;
  fax: string;
  category: string;
  accommodationTypeId: string;
  latitude: string;
  longitude: string;
  status: string;
  description: string;
}
