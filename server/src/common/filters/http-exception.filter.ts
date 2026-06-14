import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env['NODE_ENV'] === 'production';

    let message: string;
    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as Record<string, unknown>)['message'];
        message = Array.isArray(msg) ? msg.join(', ') : String(msg);
      } else {
        message = exception.message;
      }
    } else {
      // Non-HttpException: log full error, expose generic message in production
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = isProduction
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : String(exception);
    }

    if (isHttpException && statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`HTTP ${statusCode} — ${request.method} ${request.url}: ${message}`);
    } else if (isHttpException) {
      this.logger.warn(`HTTP ${statusCode} — ${request.method} ${request.url}: ${message}`);
    }

    const body: ErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }
}
