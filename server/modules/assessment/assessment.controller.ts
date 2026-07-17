import { Controller, Get, Post, Put, Patch, Body, Param, Query, Logger } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { AssessmentService } from './assessment.service';
import type { SubmitAssessmentRequest, CreateQuestionRequest, UpdateQuestionRequest, CompleteReviewRequest } from '@shared/api.interface';

@Controller('api/assessment')
export class AssessmentController {
  private readonly logger = new Logger(AssessmentController.name);

  constructor(private readonly assessmentService: AssessmentService) {}

  @Get('dimensions')
  async getDimensions() {
    return this.assessmentService.getDimensions();
  }

  @Get('questions')
  async getExamQuestions() {
    return this.assessmentService.getExamQuestions();
  }

  @Post('submit')
  async submitAssessment(@Body() body: SubmitAssessmentRequest) {
    this.logger.log(`Assessment submission from: ${body.name}, position: ${body.position}`);
    return this.assessmentService.submitAssessment(body);
  }

  @Get('admin/questions')
  async getQuestions(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = parseInt(page || '1', 10);
    const ps = parseInt(pageSize || '50', 10);
    return this.assessmentService.getQuestions(p, ps);
  }

  @NeedLogin()
  @Post('admin/questions')
  async createQuestion(@Body() body: CreateQuestionRequest) {
    return this.assessmentService.createQuestion(body);
  }

  @NeedLogin()
  @Put('admin/questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() body: UpdateQuestionRequest) {
    return this.assessmentService.updateQuestion(id, body);
  }

  @Get('admin/scoring-rules')
  async getScoringRules() {
    return this.assessmentService.getScoringRules();
  }

  @Get('admin/training-resources')
  async getTrainingResources() {
    return this.assessmentService.getTrainingResources();
  }

  @Get('admin/records')
  async getAssessmentRecords(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = parseInt(page || '1', 10);
    const ps = parseInt(pageSize || '20', 10);
    return this.assessmentService.getAssessmentRecords(p, ps);
  }

  @Get('admin/stats')
  async getAssessmentStats() {
    return this.assessmentService.getAssessmentStats();
  }

  @Get('admin/review-details')
  async getReviewDetails() {
    return this.assessmentService.getReviewDetails();
  }

  @NeedLogin()
  @Patch('admin/review/:detailId')
  async completeReview(@Param('detailId') detailId: string, @Body() body: Omit<CompleteReviewRequest, 'detailId'>) {
    return this.assessmentService.completeReview({ detailId, ...body });
  }

  @Get('admin/records/:id')
  async getRecordDetail(@Param('id') id: string) {
    return this.assessmentService.getRecordDetail(id);
  }

  @Get('admin/notifications')
  async getNotifications() {
    return this.assessmentService.getNotifications();
  }

  @Get('admin/ai-status')
  async getAiScoringStatus() {
    return this.assessmentService.getAiScoringStatus();
  }
}
