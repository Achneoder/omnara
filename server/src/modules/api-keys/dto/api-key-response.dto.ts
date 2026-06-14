export class ApiKeyResponseDto {
  id!: string;
  label!: string;
  siteId!: string;
  lastUsedAt!: Date | null;
  revokedAt!: Date | null;
  createdAt!: Date;
  // Only present on initial creation — never available again after that
  key?: string;
}
