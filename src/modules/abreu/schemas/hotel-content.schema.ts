import { Schema } from 'mongoose';

export const HotelContentSchema = new Schema({
  hotelId: String,
  name: String,
  description: String,
  location: {
    latitude: String,
    longitude: String,
  },
  city: String,
  address: String,
  province: String,
  country: String,
  postalCode: String,
  web: String,
  phones: [
    {
      info: String,
      number: String,
    },
  ],
  email: String,
  category: {
    name: String,
    value: String,
  },
  photos: [
    {
      info: String,
      fileName: String,
      title: String,
    },
  ],
  facilities: [
    {
      id: Number,
      description: String,
      groupId: Number,
    },
  ],
  currency: String,
});
