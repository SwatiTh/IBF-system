import { WaterpointsService } from './waterpoints.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Waterpoints service', (): void => {
  let service: WaterpointsService;

  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TypeOrmModule.forRoot()],
        providers: [WaterpointsService],
      }).compile();

      service = module.get<WaterpointsService>(WaterpointsService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
