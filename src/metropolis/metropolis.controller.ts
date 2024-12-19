import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MetropolisService } from './metropolis.service';
import { CreateMetropoliDto } from './dto/create-metropoli.dto';
import { UpdateMetropoliDto } from './dto/update-metropoli.dto';

@Controller('metropolis')
export class MetropolisController {
  constructor(private readonly metropolisService: MetropolisService) {}

  @Post()
  create(@Body() createMetropoliDto: CreateMetropoliDto) {
    return this.metropolisService.create(createMetropoliDto);
  }

  @Get()
  findAll() {
    return this.metropolisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metropolisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetropoliDto: UpdateMetropoliDto) {
    return this.metropolisService.update(+id, updateMetropoliDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metropolisService.remove(+id);
  }
}
