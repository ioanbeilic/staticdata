export interface CountryProviderResponse {
  OTA_ReadRS: {
    TimeStamp: string;
    Success: string;
    ReadResponse: {
      Countries: {
        Country: CountryProvider[];
      };
    };
  };
}

export interface CountryProvider {
  CountryCode: string;
  CountryName: string;
  CountryISO: string;
}
