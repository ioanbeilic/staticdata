import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { WorkToMeService } from '../../services/work-to-me/work-to-me.service';

@ApiUseTags('Work To Me')
@Controller('work-to-me')
export class WorkToMeController {
  constructor(private workToMeService: WorkToMeService) {}

  @Get('/hotels-task')
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  @ApiNoContentResponse({
    description:
      'Call app first time an get number of pages and execute te task',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishWorkToMe() {
    return this.workToMeService.getHotelsPageNumber();
  }
}
