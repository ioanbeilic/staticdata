export interface IHotel {
  Name: string;
  Zone: {
    attr: {
      JPDCode: string;
      Code: string;
    };
    Name: string;
  };
  Address: string;
  ZipCode: number;
  Latitude: string;
  Longitude: string;
  HotelCategory: string;
  City: string;
}
