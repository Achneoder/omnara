import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

function makeHost(url: string, method = 'GET'): ArgumentsHost {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const mockRequest = { url, method };

  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  const originalNodeEnv = process.env['NODE_ENV'];

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('returns the correct status and message for an HttpException with a string response', () => {
    const host = makeHost('/test');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not found',
        path: '/test',
      }),
    );
  });

  it('returns the correct status and joined message for a validation HttpException (array messages)', () => {
    const host = makeHost('/dto');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    const exception = new HttpException(
      {
        message: ['field is required', 'field must be a string'],
        statusCode: 400,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'field is required, field must be a string',
      }),
    );
  });

  it('returns a generic message for non-HttpException errors in production', () => {
    process.env['NODE_ENV'] = 'production';
    const host = makeHost('/crash');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    filter.catch(new Error('DB connection lost'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('exposes the real error message for non-HttpException errors outside production', () => {
    process.env['NODE_ENV'] = 'development';
    const host = makeHost('/crash');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    filter.catch(new Error('DB connection lost'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'DB connection lost',
      }),
    );
  });

  it('includes a timestamp and the request path in every response', () => {
    const host = makeHost('/api/resource');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    filter.catch(new HttpException('Forbidden', HttpStatus.FORBIDDEN), host);

    const body = res.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body['path']).toBe('/api/resource');
    expect(typeof body['timestamp']).toBe('string');
    expect(new Date(body['timestamp'] as string).getTime()).not.toBeNaN();
  });

  it('handles a non-HttpException that is not an Error instance', () => {
    process.env['NODE_ENV'] = 'development';
    const host = makeHost('/crash');
    const httpResponse = host.switchToHttp();
    const res = httpResponse.getResponse() as { status: jest.Mock; json: jest.Mock };

    filter.catch('some string thrown', host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'some string thrown',
      }),
    );
  });
});
