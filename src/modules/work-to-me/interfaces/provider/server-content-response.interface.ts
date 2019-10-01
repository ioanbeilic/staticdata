import { ServerHotelContentInterface } from './content.interface';

export interface ServerContentResponse {
  Envelope: {
    Body: {
      HotelContentResponse: {
        ContentRS: {
          Url: string;
          TimeStamp: string;
          IntCode: string;
          Warnings: {
            Warning: {
              Code: string;
              Text: string;
            };
          };
          Contents: ServerHotelContentInterface;
        };
      };
    };
  };
}
