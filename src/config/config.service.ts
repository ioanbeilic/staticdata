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
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
