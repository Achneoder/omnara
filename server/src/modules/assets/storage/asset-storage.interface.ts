export interface AssetStorage {
  store(buffer: Buffer, siteId: string, filename: string): Promise<string>;
  delete(storagePath: string): Promise<void>;
  getAbsolutePath(storagePath: string): string;
}
