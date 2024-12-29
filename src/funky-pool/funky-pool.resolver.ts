import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FunkyPoolService } from './funky-pool.service';

@Resolver('Developer')
export class FunkyPoolResolver {
  constructor(private readonly funkyPoolService: FunkyPoolService) {}

  @Query('funkyPool')
  funkyPool() {
    return this.funkyPoolService.getFunkyPool();
  }

  @Mutation('voteOnDeveloper')
  voteOnDeveloper(@Args('id') id: string) {
    return this.funkyPoolService.voteOnDeveloper(id);
  }
}
