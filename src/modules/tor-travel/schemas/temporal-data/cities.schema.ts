import { Schema } from 'mongoose';

export const CitiesSchema = new Schema({
  ID: String,
  Name: String,
  'Province/region/state ID': String,
  'Province/region/state Name': String,
  'Country ID': String,
  'Country Name': String,
});
