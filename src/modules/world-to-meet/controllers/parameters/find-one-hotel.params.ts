import { ApiImplicitParam } from '@nestjs/swagger';

export class FindOneHotel {
  hotelId!: string;
}

export function ApiIdParamHotel() {
  return ApiImplicitParam({
    name: 'hotelId',
    type: 'string',
    description: 'id of hotel to be requested',
    required: true,
  });
}
