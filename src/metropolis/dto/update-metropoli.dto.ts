import { PartialType } from '@nestjs/swagger';
import { CreateMetropoliDto } from './create-metropoli.dto';

export class UpdateMetropoliDto extends PartialType(CreateMetropoliDto) {}
