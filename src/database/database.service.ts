import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

export const databaseProviders = [
  /**
   * mongo database connection with mongoose
   * inject ConfigModule and ConfigService to Mongoose module
   * useNewUrlParser and useUnifiedTopology - fix mongoose insure (is world without this, default value 'false)
   */
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get('MONGODB_URI'),
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    inject: [ConfigService],
  }),
];
