export interface HotelDetailsProviderResponse {
  OTA_HotelInfoRS: {
    TimeStamp: string;
    Id: string;
    Hotel: {
      Info: HotelDetailsProvider;
    };
  };
}

export interface ImageProvider {
  Category: string;
  URL: string;
}

/**
 * facilities
 */
export interface Descriptive {
  Type: string;
  Text: {
    __cdata: string;
  };
}

export interface HotelDetailsProvider {
  HotelCode: string;
  HotelName: string;
  HotelCityCode: string;
  Rating: string;
  Descriptions: {
    Descriptive: Descriptive[];
  };
  Position: {
    Lat: string;
    Lon: string;
    Accuracy: string;
  };
  Address: {
    AddressLine: {
      __cdata: string;
    };
    CityName: string;
    PostalCode: string;
    CountryName: string;
  };
  Contacts: {
    Phone: string;
    Fax: string;
    Email: string;
    Website: string;
  };
  Images: {
    Image: ImageProvider[];
  };
}
