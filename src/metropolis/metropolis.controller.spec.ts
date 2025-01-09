import { Test, TestingModule } from '@nestjs/testing';
import { MetropolisController } from './metropolis.controller';
import { MetropolisService } from './metropolis.service';

describe('MetropolisController', () => {
  let controller: MetropolisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetropolisController],
      providers: [MetropolisService],
    }).compile();

    controller = module.get<MetropolisController>(MetropolisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
