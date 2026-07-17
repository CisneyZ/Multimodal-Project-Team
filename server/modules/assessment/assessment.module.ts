import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { ScoringService } from './scoring.service';
import { AiScoringService } from './ai-scoring.service';
import { NotificationService } from './notification.service';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService, ScoringService, AiScoringService, NotificationService],
})
export class AssessmentModule {}
