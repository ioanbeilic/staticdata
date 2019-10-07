import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return `
    ApiRest - Tecnoturis - static data</br>
    <a href = "${this.configService.get(Configuration.HOST)}/api">Swagger</a>
    `;
  }
}
