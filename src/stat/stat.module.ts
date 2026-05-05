import { forwardRef, Module } from '@nestjs/common';
import { StatService } from './stat.service';
import { StatResolver } from './stat.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [StatResolver, StatService],
  exports: [StatService],
})
export class StatModule {}
