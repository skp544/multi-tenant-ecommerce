import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAccessPayload } from '../../auth/types/jwt-payload.types.js';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtAccessPayload => {
    const request = context.switchToHttp().getRequest<Request>();

    return request.user as JwtAccessPayload;
  },
);
