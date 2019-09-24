import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WorkToMeService } from '../../services/work-to-me/work-to-me.service';

@Controller('work-to-me')
export class WorkToMeController {
  constructor(private workToMeService: WorkToMeService) {}

  @Get('/init')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ title: 'initialize process for RabbitMq' })
  // @ApiIdParamPage()
  @ApiNoContentResponse({
    description: 'Call app first time an get number of pages',
  })
  @ApiBadRequestResponse({ description: 'The provider server is down' })
  public publishWorkToMe() {
    this.workToMeService.getHotelsPageNumber();
  }
}
