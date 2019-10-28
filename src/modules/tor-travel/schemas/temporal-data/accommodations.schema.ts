import { Schema } from 'mongoose';

export const AccommodationsSchema = new Schema({
  ID: String,
  Name: String,
  Address: String,
  Zip: String,
  Giata: String,
  'City ID': String,
  Phone: String,
  Fax: String,
  Category: String,
  'Accommodation Type ID': String,
  Latitude: String,
  Longitude: String,
  Status: String,
  Description: String,
});
