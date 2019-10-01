import { Injectable } from '@nestjs/common';

@Injectable()
export class HotelsService {
  /**
   * provider query param
   */
  fields = 'all';
  language = 'ENG';
  from = 1;
  to = 100;
  useSecondaryLanguage = false;

  url = 'https://api.test.hotelbeds.com';
  query = `/hotel-content-api/1.0/hotels?fields=${this.fields}&language=${this.language}&from=${this.from}&to=${this.to}&useSecondaryLanguage=${this.useSecondaryLanguage}`;
}
