import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { Logger } from 'winston';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  getHello(): string {
    this.logger.error('Hello World');
    return `
    ApiRest - Tecnoturis - static data</br>
    <a href = "${this.configService.get(Configuration.HOST)}/api">Swagger</a>
    `;
  }
}
