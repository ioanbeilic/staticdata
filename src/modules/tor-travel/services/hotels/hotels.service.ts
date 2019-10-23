import { Injectable, Inject, Logger } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { ConfigService } from '../../../../config/config.service';
import { Configuration } from '../../../../config/config.keys';
import Client from 'ssh2-sftp-client';
import fs from 'fs';

@Injectable()
export class HotelsService {
  sftp = new Client();
  config: {
    host: string;
    port: number;
    username: string;
    password: string;
  };

  constructor(
    public readonly amqpConnection: AmqpConnection,

    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger, // private createHotelAdapter: CreateHotelAdapter,
  ) {
    this.config = {
      host: this.configService.get(Configuration.TOR_TRAVEL_FTP_HOST),
      port: Number(this.configService.get(Configuration.TOR_TRAVEL_FTP_PORT)),
      username: this.configService.get(Configuration.TOR_TRAVEL_FTP_USERNAME),
      password: this.configService.get(Configuration.TOR_TRAVEL_FTP_PASSWORD),
    };
  }

  async getCity() {
    try {
      await this.sftp.connect(this.config);

      let list = await this.sftp.list('/');

      console.log(list);

      for (const el of list) {
        if (el.name === 'Cities_ES.csv.gz') {
          await this.sftp.fastGet(
            '/' + list[0].name,
            `./downloads/${list[0].name}`,
          );
        }
      }

      /*
      await this.sftp.download('/public_html/test2', 'test2/', {
          overwrite: 'all'
      },  (result) {
          console.log(result);
      });
*/
    } catch (error) {
      console.log(error, 'catch error');
    }
  }
}
