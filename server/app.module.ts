import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PlatformModule } from '@lark-apaas/fullstack-nestjs-core';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { V11Module } from './modules/v11/v11.module';
import { TalentModule } from './modules/talent/talent.module';
import { ViewModule } from './modules/view/view.module';

@Module({
  imports: [
    PlatformModule.forRoot({
      enableCsrf: false,
    }),

    // ====== @route-section: business-modules START ======
    // Place all business modules here.Do NOT add fallback modules here.
    AssessmentModule,
    OnboardingModule,
    V11Module,
    TalentModule,
    // ====== @route-section: business-modules END ======

    // @route-order: last
    // ViewModule is the fallback route module, must be registered last.
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}


