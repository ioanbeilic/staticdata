import { Module } from '@nestjs/common';
import { databaseProviders } from './database.service';

/**
 * database connection module
 * this module create all database connection module
 */

@Module({
  imports: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
