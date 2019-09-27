export interface HotelContent {
  Code: string;
  JPCode: string;
  HotelName: string;
  Zone: {
    JPDCode: string;
    Code: string;
    Name: string;
  };
  HotelCategory: string;
  Address: {
    Address: string;
    PostalCode: string;
    Latitude: number;
    Longitude: number;
  };
  ContactInfo: {
    PhoneNumbers: [{ PhoneNumber: string }];
  };

  Image: Image[];
  Description: Description[];
  JPRoom: [
    {
      JRCode: string;
    },
  ];
}

interface Image {
  Type: string;
  FileName: string;
  Title: string;
}
interface Description {
  name: string;
  Type: string;
}
