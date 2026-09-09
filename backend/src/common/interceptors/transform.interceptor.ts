import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

// A controller can either return plain data (e.g. `return user;`)
// or return this shape to set a custom message: `return { data: user, message: 'User registered' };`
interface ControllerResult<T> {
  data?: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((result: T | ControllerResult<T>) => {
        if (result && typeof result === 'object' && 'message' in result) {
          const { message, data } = result as ControllerResult<T>;
          return {
            success: true,
            data: data ?? null,
            message: message ?? 'Success',
          };
        }

        return {
          success: true,
          data: (result as T) ?? null,
          message: 'Success',
        };
      }),
    );
  }
}
