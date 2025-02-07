import { PartialType } from '@nestjs/swagger';
import { CreateRolDto } from './create-rols.dto';

export class UpdateRolDto extends PartialType(CreateRolDto) { }
