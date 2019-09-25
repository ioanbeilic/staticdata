import { Injectable, HttpService } from '@nestjs/common';
import { RabbitSubscribe } from '@nestjs-plus/rabbitmq';

@Injectable()
export class RabbitMqService {
  constructor(private readonly http: HttpService) {}

  @RabbitSubscribe({
    exchange: 'exchange2',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`); // tslint:disable-line
  }
  /*
  @RabbitSubscribe({
    exchange: 'exchange2',
    routingKey: 'work-to-me',
    queue: 'hotels',
  })
  public async subscribeWorkToMe(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`); // tslint:disable-line
  }
  */
}
