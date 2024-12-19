import { Module } from '@nestjs/common';
import { MetropolisService } from './metropolis.service';
import { MetropolisController } from './metropolis.controller';

@Module({
  controllers: [MetropolisController],
  providers: [MetropolisService],
})
export class MetropolisModule {}
