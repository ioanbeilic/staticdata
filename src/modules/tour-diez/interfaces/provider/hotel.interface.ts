export interface ServerHotelInterface {
  hotelDescriptionsResult: {
    result: {
      cod_result: string;
      des_result: string;
      type_message: string;
    };
    totalHotels: number;
    totalHotelsRetrieved: number;
    operationCode: string;
    hotelDescriptions: {
      hotelDescriptionsBean: HotelDescriptionsBean[];
    };
  };
}

export interface ServerErrorResult {
  ErrorResult: {
    result: {
      cod_result: string;
      des_result: string;
      type_message: string;
    };
  };
}

export interface HotelDescriptionsBean {
  hotelName: string;
  hotelID: string;
  address: string;
  country: string;
  codeCountry: string;
  city: string;
  codeCity: string;
  district: string;
  codeDistrict: string;
  category: { claveCategoria: string; nombre: string };
  postalCode: string;
  telephoneNumber: string;
  faxNumber: string;
  url: { nil: boolean };
  emailAddress: { nil: boolean };
  latitude: string;
  longitude: string;
  description: { nil: boolean };
}
