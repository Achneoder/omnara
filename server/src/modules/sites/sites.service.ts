import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Site } from './entities/site.entity.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';

@Injectable()
export class SitesService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<Site[]> {
    return this.em.find(Site, {});
  }

  async findOne(id: string): Promise<Site> {
    const site = await this.em.findOne(Site, { id });
    if (!site) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return site;
  }

  async create(dto: CreateSiteDto): Promise<Site> {
    const site = new Site();
    site.name = dto.name;
    site.url = dto.url;
    site.platform = dto.platform;
    if (dto.domain !== undefined) {
      site.domain = dto.domain;
    }
    if (dto.settings !== undefined) {
      site.settings = dto.settings;
    }
    this.em.persist(site);
    await this.em.flush();
    return site;
  }

  async update(id: string, dto: UpdateSiteDto): Promise<Site> {
    const site = await this.findOne(id);
    if (dto.name !== undefined) site.name = dto.name;
    if (dto.url !== undefined) site.url = dto.url;
    if (dto.platform !== undefined) site.platform = dto.platform;
    if (dto.domain !== undefined) site.domain = dto.domain;
    if (dto.settings !== undefined) site.settings = dto.settings;
    await this.em.flush();
    return site;
  }

  async remove(id: string): Promise<void> {
    const site = await this.findOne(id);
    this.em.remove(site);
    await this.em.flush();
  }
}
