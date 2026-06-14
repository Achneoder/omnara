// Lightweight stub used by Jest moduleNameMapper to avoid importing
// the real @mikro-orm packages (which use import.meta / ESM-only APIs
// incompatible with ts-jest's CommonJS transform).
//
// Tests that need EntityManager / repository token inject mock values
// via NestJS TestingModule providers — they never call real ORM methods.

export class EntityManager {
  findOne = jest.fn();
  find = jest.fn();
  create = jest.fn();
  flush = jest.fn();
  persist = jest.fn();
  transactional = jest.fn();
}

export class EntityRepository {
  findOne = jest.fn();
  find = jest.fn();
  create = jest.fn();
  flush = jest.fn();
}

export const MikroORM = {};
export const MikroOrmModule = {
  forRoot: jest.fn().mockReturnValue({ module: class {} }),
  forRootAsync: jest.fn().mockReturnValue({ module: class {} }),
  forFeature: jest.fn().mockReturnValue({ module: class {} }),
};

export const PostgreSqlDriver = {};
export const TsMorphMetadataProvider = {};
export const Migrator = {};

// Decorators — return identity functions so decorated classes/properties compile
export const Entity = () => (target: unknown) => target;
export const Property = () => (_target: unknown, _key: string) => undefined;
export const PrimaryKey = () => (_target: unknown, _key: string) => undefined;
export const ManyToOne = () => (_target: unknown, _key: string) => undefined;
export const OneToMany = () => (_target: unknown, _key: string) => undefined;
export const ManyToMany = () => (_target: unknown, _key: string) => undefined;
export const OneToOne = () => (_target: unknown, _key: string) => undefined;
export const Unique = () => (_target: unknown, _key: string) => undefined;
export const Index = () => (_target: unknown, _key: string) => undefined;
export const Enum = () => (_target: unknown, _key: string) => undefined;
export const BeforeCreate = () => (_target: unknown, _key: string) => undefined;
export const BeforeUpdate = () => (_target: unknown, _key: string) => undefined;
export const AfterUpdate = () => (_target: unknown, _key: string) => undefined;

export const defineConfig = (config: unknown) => config;

// Collection stub — used as the default initializer for @OneToMany fields in entities.
// Tests never call real collection methods; this only needs to exist and be constructable.
export class Collection<T> {
  private items: T[] = [];

  constructor(_owner: unknown, items?: T[]) {
    if (items) this.items = items;
  }
  getItems(): T[] {
    return this.items;
  }
  add(..._items: T[]): void {}
  remove(..._items: T[]): void {}
  contains(_item: T): boolean {
    return false;
  }
  count(): number {
    return this.items.length;
  }
  isInitialized(): boolean {
    return true;
  }
}

export function getRepositoryToken(entity: unknown): string {
  return `${String(entity)}Repository`;
}
