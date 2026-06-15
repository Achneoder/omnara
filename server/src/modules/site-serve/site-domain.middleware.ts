import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/postgresql';
import { Site } from '../sites/entities/site.entity.js';

// Matches bare IPv4 addresses (e.g. 192.168.1.1) to skip domain lookup.
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

@Injectable()
export class SiteDomainMiddleware implements NestMiddleware {
  constructor(private readonly em: EntityManager) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const hostHeader = req.headers.host ?? '';
    // Strip optional port suffix (e.g. "myblog.com:3000" → "myblog.com")
    const hostname = hostHeader.split(':')[0].toLowerCase();

    if (!hostname || hostname === 'localhost' || IPV4_RE.test(hostname)) {
      next();
      return;
    }

    const site = await this.em.findOne(Site, { domain: hostname });
    if (site) {
      (req as Request & { domainSiteId?: string }).domainSiteId = site.id;
    }

    next();
  }
}
