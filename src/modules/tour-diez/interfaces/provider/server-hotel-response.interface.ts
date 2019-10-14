import { ServerHotelInterface } from './hotel.interface';

export interface HotelServerResponse {
  Envelope: {
    Body: {
      HotelPortfolioResponse: {
        HotelPortfolioRS: {
          Url: string;
          TimeStamp: string;
          IntCode: number;
          HotelPortfolio: {
            Page: number;
            TotalPages: number;
            TotalRecords: number;
            NextToken: string;
            Hotel?: ServerHotelInterface[];
          };
        };
      };
    };
  };
}
