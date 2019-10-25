import t from 'typy';
import { HotelServerResponse } from '../interfaces/provider/server-hotel-response.interface';

export class Page {
  page: number;
  totalPages: number;
  totalRecords: number;
  nextToken: string;

  constructor(json: HotelServerResponse) {
    this.page =
      t(
        json,
        'Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.Page',
      ).safeObject || 0;

    this.totalPages =
      t(
        json,
        'Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.TotalPages',
      ).safeObject || 0;

    this.totalRecords =
      t(
        json,
        'Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.TotalRecords',
      ).safeObject || 0;

    this.nextToken =
      t(
        json,
        'Envelope.Body.HotelPortfolioResponse.HotelPortfolioRS.HotelPortfolio.NextToken',
      ).safeObject || '';
  }
}
