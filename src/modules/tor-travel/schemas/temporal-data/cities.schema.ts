import { Schema } from 'mongoose';

export const CitiesSchema = new Schema({
  cityId: String,
  name: String,
  provinceId: String,
  province: String,
  countryId: String,
  country: String,
});
