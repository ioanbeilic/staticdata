export interface WorkToMeHotel {
  type: string;
  JPCode: string;
  HasSynonyms: boolean;
  Name: string;
  Zone: {
    JPDCode: string;
    Code: number;
    Name: string;
  };
  Address: string;
  ZipCode: string;
  Latitude: number;
  Longitude: number;
  HotelCategory: {
    name: string;
    Type: string;
    Code: number;
  };
  City: {
    name: string;
    Id: number;
    JPDCode: string;
  };
}
