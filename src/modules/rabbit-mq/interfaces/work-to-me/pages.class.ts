import { HotelServerResponse } from './provider/server-hotel-response.interface';

export class Page {
  page: number;
  totalPages: number;
  totalRecords: number;
  nextToken: string;

  constructor(json: HotelServerResponse) {
    this.page =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.Page;
    this.totalPages =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.TotalPages;
    this.totalRecords =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.TotalRecords;
    this.nextToken =
      json.Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.NextToken;
  }
}
