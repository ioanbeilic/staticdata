import { Schema } from 'mongoose';

export const AccommodationsSchema = new Schema({
  hotelId: String,
  name: String,
  address: String,
  postalCode: String,
  Giata: String,
  cityId: String,
  phone: String,
  fax: String,
  category: String,
  accommodationTypeId: String,
  latitude: String,
  longitude: String,
  status: String,
  description: String,
});
