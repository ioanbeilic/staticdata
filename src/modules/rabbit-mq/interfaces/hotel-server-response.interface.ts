import { Hotel } from './hotel.interface';

export interface IHotelServerResponse {
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
            Hotel?: Hotel[];
          };
        };
      };
    };
  };
}
