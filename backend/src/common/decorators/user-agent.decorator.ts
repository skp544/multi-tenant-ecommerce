import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface ClientInfo {
  browser?: string;
  os?: string;
  // only set for phones and tablets, desktop browsers have no device model
  device?: string;
}

export const ParsedUserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClientInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const { browser, os, device } = new UAParser(
      request.headers['user-agent'] ?? '',
    ).getResult();

    return { browser: browser.name, os: os.name, device: device.model };
  },
);
