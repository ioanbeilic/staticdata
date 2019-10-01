import { ApiImplicitParam } from '@nestjs/swagger';

export class FindOneHotelDetails {
  hotelId!: string;
}

export function ApiIdParamHotelDetails() {
  return ApiImplicitParam({
    name: 'hotelId',
    type: 'string',
    description: 'id of hotel to be requested',
    required: true,
  });
}
