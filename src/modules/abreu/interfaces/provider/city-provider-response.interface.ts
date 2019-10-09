export interface CityProviderResponse {
  OTA_ReadRS: {
    TimeStamp: string;
    Success: string;
    ReadResponse: {
      Cities: {
        City: CityProvider[];
      };
    };
  };
}

export interface CityProvider {
  CityCode: string;
  CityName: string;
  CountryName: string;
  CountryCode: number;
  CountryISO: string;
}
