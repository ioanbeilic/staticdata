import { Schema } from 'mongoose';

export const AccommodationsTypesSchema = new Schema({
  hotelId: String,
  name: String,
});
