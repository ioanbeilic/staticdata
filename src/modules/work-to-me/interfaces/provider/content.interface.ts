export interface ServerHotelContentInterface {
  Code: string;
  JPCode: string;
  HotelName: string;
  Zone: {
    JPDCode: string;
    Code: string;
    Name: string;
  };
  HotelCategory: {
    name: string;
    Type: string;
  };
  Address: {
    Address: string;
    PostalCode: string;
    Latitude: string;
    Longitude: string;
  };
  ContactInfo: {
    PhoneNumbers: PhoneNumber[];
  };
  Images: {
    Image: Image[];
  };
  Descriptions: {
    Description: Description[];
  };

  Features: {
    Feature: Feature[];
  };

  JPRooms: {
    JPRoom: [
      {
        JRCode: string;
      },
    ];
  };
}

export interface Image {
  Type: string;
  FileName: string;
  Title: string;
}
export interface Description {
  name: string;
  Type: string;
}
export interface PhoneNumber {
  name: string;
  Type: string;
}

export interface Feature {
  name: string;
  Type: string;
}
