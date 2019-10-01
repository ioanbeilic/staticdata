export interface ServerHotelInterface {
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
  Latitude: string;
  Longitude: string;
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
