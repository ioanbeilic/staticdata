import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WorkToMeService } from '../../services/work-to-me/work-to-me.service';

@Controller('work-to-me')
export class WorkToMeController {
  constructor(private readonly workToMeService: WorkToMeService) {}

  @Get('/work-to-me/{page}')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ title: 'Add url to be processed with RabbitMq' })
  // @ApiIdParamPage()
  @ApiNoContentResponse({
    description: 'The message has ben successfully added to queue',
  })
  @ApiBadRequestResponse({ description: 'The page number does not exist' })
  public async publishWorkToMe(): Promise<any[]> {
    return this.workToMeService.getHotels();
  }
}
