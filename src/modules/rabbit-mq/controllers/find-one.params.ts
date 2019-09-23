import { ApiImplicitParam } from '@nestjs/swagger';

export class FindOneParamPage {
  page!: number;
}

export function ApiIdParamPage() {
  return ApiImplicitParam({
    name: 'id',
    type: 'string',
    description: 'request data identifier',
    required: true,
  });
}
