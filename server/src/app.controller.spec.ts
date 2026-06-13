import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return hello message', () => {
    expect(appController.getHello()).toBe('omnara MCP Server is running');
  });

  it('should return health status with ok and timestamp', () => {
    const health = appController.getHealth();
    expect(health.status).toBe('ok');
    expect(typeof health.timestamp).toBe('string');
  });
});
