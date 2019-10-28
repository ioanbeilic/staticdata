import { Document } from 'mongoose';

export interface Accommodations extends Document {
  ID: string;
  Name: string;
  Address: string;
  Zip: string;
  Giata: string;
  'City ID': string;
  Phone: string;
  Fax: string;
  Category: string;
  'Accommodation Type ID': string;
  Latitude: string;
  Longitude: string;
  Status: string;
  Description: string;
}
