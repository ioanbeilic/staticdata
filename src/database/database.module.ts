import { Module } from '@nestjs/common';
import { databaseProviders } from './database.service';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';

/**
 * database connection module
 * this module create all database connection module
 */

@Module({
  imports: [...databaseProviders, AmqpConnection],
  exports: [...databaseProviders, AmqpConnection],
})
export class DatabaseModule {}
