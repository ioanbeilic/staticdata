import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';

export const databaseProviders = [
  /**
   * mongo database connection with mongoose
   * inject ConfigModule and ConfigService to Mongoose module
   * useNewUrlParser and useUnifiedTopology - fix mongoose insure (is work without this, default value 'false)
   */
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get('MONGODB_URI'),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    inject: [ConfigService],
  }),
];
