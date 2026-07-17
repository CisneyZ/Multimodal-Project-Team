import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { ChatService } from './chat.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, ChatService],
  exports: [OnboardingService, ChatService],
})
export class OnboardingModule {}
