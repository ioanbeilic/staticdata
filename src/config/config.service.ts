import * as fs from 'fs';
import { parse } from 'dotenv';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const isDevelopmentEnv = process.env.NODE_ENV !== 'production';

    if (isDevelopmentEnv) {
      const envFilePath = __dirname + '/../../.env';
      const existPath = fs.existsSync(envFilePath);

      if (!existPath) {
        console.error('.env file does not exist'); // tslint:disable-line
        process.exit(0);
      }

      this.envConfig = parse(fs.readFileSync(envFilePath));
    } else {
      // to do - load all variable from process.env
      this.envConfig = {
        PORT: process.env.PORT as string,
        MONGODB_URI: process.env.PORT as string,
        RABBITMQ_URI: process.env.RABBITMQ_URI as string,
        HOST: process.env.HOST as string,
        WORLD_TO_ME_URL: process.env.WORLD_TO_ME_URL as string,
        WORLD_TO_ME_PASSWORD: process.env.WORLD_TO_ME_PASSWORD as string,
        WORLD_TO_ME_LOGIN: process.env.WORLD_TO_ME_LOGIN as string,
        BEDS_ONLINE_URL: process.env.BEDS_ONLINE_URL as string,
        BEDS_ONLINE_API_KEY: process.env.BEDS_ONLINE_API_KEY as string,
        BEDS_ONLINE_SECRET: process.env.BEDS_ONLINE_SECRET as string,
        ELASTICSEARCH_HOST: process.env.ELASTICSEARCH_HOST as string,
        ABREU_URL: process.env.ABREU_URL as string,
        ABREU_URL_DETAILS: process.env.ABREU_URL_DETAILS as string,
        ABREU_USERNAME: process.env.ABREU_USERNAME as string,
        ABREU_PASSWORD: process.env.ABREU_PASSWORD as string,
        ABREU_CONTEXT: process.env.ABREU_CONTEXT as string,
        TOUR_DIEZ_URL: process.env.TOUR_DIEZ_URL as string,
        TOUR_DIEZ_USER: process.env.TOUR_DIEZ_USER as string,
        TOUR_DIEZ_PASSWORD: process.env.TOUR_DIEZ_PASSWORD as string,
        TOUR_DIEZ_URL_V3: process.env.TOUR_DIEZ_URL_V3 as string,
        TOUR_DIEZ_USER_V3: process.env.TOUR_DIEZ_USER_V3 as string,
        TOUR_DIEZ_PASSWORD_V3: process.env.TOUR_DIEZ_PASSWORD_V3 as string,
        TOR_TRAVEL_FTP_HOST: process.env.TOR_TRAVEL_FTP_HOST as string,
        TOR_TRAVEL_FTP_PORT: process.env.TOR_TRAVEL_FTP_PORT as string,
        TOR_TRAVEL_FTP_USERNAME: process.env.TOR_TRAVEL_FTP_USERNAME as string,
        TOR_TRAVEL_FTP_PASSWORD: process.env.TOR_TRAVEL_FTP_PASSWORD as string,
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
