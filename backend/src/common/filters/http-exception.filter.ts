import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    // ValidationPipe errors look like: { message: ['email must be an email', ...] }
    // Plain HttpExceptions can just be a string, e.g. throw new NotFoundException('User not found')

    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      const res = exceptionResponse as { message?: string | string[] };

      message = Array.isArray(res.message)
        ? res.message[0]
        : (res.message ?? exception.message);
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
    });
  }
}
