import { Module } from '@nestjs/common';
import { V11Controller } from './v11.controller';
import { V11Service } from './v11.service';

@Module({
  controllers: [V11Controller],
  providers: [V11Service],
  exports: [V11Service],
})
export class V11Module {}
