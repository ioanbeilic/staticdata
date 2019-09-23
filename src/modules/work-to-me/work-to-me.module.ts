import { Module } from '@nestjs/common';
import { WorkToMeService } from './services/work-to-me/work-to-me.service';
import { WorkToMeController } from './controllers/work-to-me/work-to-me.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [WorkToMeService],
  controllers: [WorkToMeController],
})
export class WorkToMeModule {}
