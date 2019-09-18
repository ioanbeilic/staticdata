import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  /**
   * Export config as singleton
   */

  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
