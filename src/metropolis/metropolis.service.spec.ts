import { Test, TestingModule } from '@nestjs/testing';
import { MetropolisService } from './metropolis.service';

describe('MetropolisService', () => {
  let service: MetropolisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetropolisService],
    }).compile();

    service = module.get<MetropolisService>(MetropolisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
