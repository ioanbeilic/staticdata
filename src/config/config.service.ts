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
        WORK_TO_ME_URL: process.env.WORK_TO_ME_URL as string,
        WORK_TO_ME_PASSWORD: process.env.WORK_TO_ME_PASSWORD as string,
        WORK_TO_ME_LOGIN: process.env.WORK_TO_ME_LOGIN as string,
        BEDS_ONLINE_URL: process.env.BEDS_ONLINE_URL as string,
        BEDS_ONLINE_API_KEY: process.env.BEDS_ONLINE_API_KEY as string,
        BEDS_ONLINE_SECRET: process.env.BEDS_ONLINE_SECRET as string,
        ELASTICSEARCH_HOST: process.env.ELASTICSEARCH_HOST as string,
        ABREU_URL: process.env.ABREU_URL as string,
        ABREU_USERNAME: process.env.ABREU_USERNAME as string,
        ABREU_PASSWORD: process.env.ABREU_PASSWORD as string,
        ABREU_CONTEXT: process.env.ABREU_CONTEXT as string,
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
