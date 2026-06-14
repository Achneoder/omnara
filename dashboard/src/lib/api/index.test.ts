import { describe, it, expect } from 'vitest';
import { ApiError } from './index';

describe('ApiError', () => {
  it('has correct name', () => {
    const err = new ApiError(404, 'Not found');
    expect(err.name).toBe('ApiError');
  });

  it('stores status code', () => {
    const err = new ApiError(500, 'Server error');
    expect(err.status).toBe(500);
  });

  it('stores message', () => {
    const err = new ApiError(400, 'Bad request');
    expect(err.message).toBe('Bad request');
  });

  it('is instance of Error', () => {
    const err = new ApiError(401, 'Unauthorized');
    expect(err).toBeInstanceOf(Error);
  });
});
