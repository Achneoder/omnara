import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { Request, Response } from 'express';
import { SiteDomainMiddleware } from './site-domain.middleware.js';
import { Site } from '../sites/entities/site.entity.js';

const mockEntityManager = {
  findOne: jest.fn(),
};

type DomainRequest = Request & { domainSiteId?: string };

function makeReq(host: string): DomainRequest {
  return { headers: { host } } as unknown as DomainRequest;
}

describe('SiteDomainMiddleware', () => {
  let middleware: SiteDomainMiddleware;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteDomainMiddleware, { provide: EntityManager, useValue: mockEntityManager }],
    }).compile();

    middleware = module.get<SiteDomainMiddleware>(SiteDomainMiddleware);
  });

  it('sets domainSiteId when a site matches the hostname', async () => {
    const site = { id: 'site-uuid-1' } as Site;
    mockEntityManager.findOne.mockResolvedValueOnce(site);

    const req = makeReq('myblog.com');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).toHaveBeenCalledWith(Site, { domain: 'myblog.com' });
    expect(req.domainSiteId).toBe('site-uuid-1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next without setting domainSiteId when no site matches', async () => {
    mockEntityManager.findOne.mockResolvedValueOnce(null);

    const req = makeReq('unknown.example.com');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).toHaveBeenCalledWith(Site, { domain: 'unknown.example.com' });
    expect(req.domainSiteId).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('skips lookup for localhost and still calls next', async () => {
    const req = makeReq('localhost');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).not.toHaveBeenCalled();
    expect(req.domainSiteId).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('skips lookup for IPv4 addresses', async () => {
    const req = makeReq('192.168.1.1');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('strips port from host header before lookup', async () => {
    const site = { id: 'site-uuid-2' } as Site;
    mockEntityManager.findOne.mockResolvedValueOnce(site);

    const req = makeReq('myblog.com:3000');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).toHaveBeenCalledWith(Site, { domain: 'myblog.com' });
    expect(req.domainSiteId).toBe('site-uuid-2');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('skips lookup for localhost with port', async () => {
    const req = makeReq('localhost:3000');
    const next = jest.fn();

    await middleware.use(req, {} as Response, next);

    expect(mockEntityManager.findOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
