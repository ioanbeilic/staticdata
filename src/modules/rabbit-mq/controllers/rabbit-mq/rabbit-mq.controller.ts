import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ApiIdParamPage } from '../find-one.params';

@Controller('rabbit-mq')
export class RabbitMqController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get('/pubsub')
  public async publishMessage() {
    await this.amqpConnection.publish('exchange2', 'subscribe-route', {
      message: 42,
    });
    return {
      result: 'Published message',
    };
  }

  @Get('/work-to-me/{page}')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Add url to be processed with RabbitMq' })
  @ApiIdParamPage()
  @ApiNoContentResponse({
    description: 'The message has ben successfully added to queue',
  })
  @ApiBadRequestResponse({ description: 'The page number does not exist' })
  public async publishWorkToMe() {
    await this.amqpConnection.publish('exchange2', 'work-to-me', {
      message: 42,
    });
    return {
      result: 'Published message',
    };
  }
}
