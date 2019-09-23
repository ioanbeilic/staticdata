import * as fs from 'fs';
import { parse } from 'dotenv';

export class ConfigService {
  private readonly envConfig: { [key: string]: string | undefined };

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
        PORT: process.env.PORT,
        MONGODB_URI: process.env.PORT,
        RABBITMQ_URI: process.env.RABBITMQ_URI,
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
