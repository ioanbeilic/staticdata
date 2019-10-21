import { Document } from 'mongoose';

export interface HotelDetails extends Document {
  hotelId: string;
  name: string;
  description: string;
  location: {
    latitude: string;
    longitude: string;
  };
  city: string;
  address: string;
  province: string;
  country: string;
  postalCode: string;
  web: string;
  phones: [
    {
      number: string;
      info: string;
    },
  ];
  email: string;
  category: {
    name: string;
    value: string;
  };
  photos: [
    {
      info: string;
      fileName: string;
      title: string;
    },
  ];
  facilities: [
    {
      id: number;
      description: string;
      groupId: number;
    },
  ];
  currency: string;
}
