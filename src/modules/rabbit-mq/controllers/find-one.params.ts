import { ApiImplicitParam } from '@nestjs/swagger';

export class FindOneParamPage {
  page!: number;
}

export function ApiIdParamPage() {
  return ApiImplicitParam({
    name: 'page',
    type: 'number',
    description: 'Number of page to be requested',
    required: true,
  });
}
