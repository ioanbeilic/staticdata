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
    Latitude: number;
    Longitude: number;
  };
  ContactInfo: {
    PhoneNumbers: {
      PhoneNumber: {
        name: string;
        Type: string;
      };
    };
  };
  Images: {
    Image: Image[];
  };
  Descriptions: {
    Description: Description[];
  };
  JPRooms: {
    JPRoom: [
      {
        JRCode: string;
      },
    ];
  };
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
