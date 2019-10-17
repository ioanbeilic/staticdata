export interface HotelProviderResponse {
  OTA_HotelSearchRS: {
    TimeStamp: string;
    Success: string;
    Properties: {
      Property: PropertyResponse | PropertyResponse[];
    };
  };
}

export interface PropertyResponse {
  HotelCode: string;
  HotelName: string;
  Position: {
    Latitude: string;
    Longitude: string;
  };
  Address: {
    AddressLine: {
      __cdata: string;
    };
    CityName: string;
    PostalCode: number;
    CountryName: string;
    TPA_Extensions: {
      CityCode: number;
      CountryCode: number;
      CountryISO: string;
    };
  };
  ContactNumbers: {
    ContactNumber: {
      PhoneNumber: string;
      PhoneTechType: string;
    };
  };
  Award: {
    Rating: string;
  };
}
