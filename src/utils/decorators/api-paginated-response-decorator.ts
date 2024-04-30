import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: `Successful for paginated list of ${model.name}`,
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
          {
            properties: {
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  lastPage: { type: 'number' },
                  currentPage: { type: 'number' },
                  perPage: { type: 'number' },
                  prev: { type: 'number' },
                  next: { type: 'number' },
                },
              },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({ description: 'Invalid request parameters' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized access' }),
  );
};
