import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { V11Service } from './v11.service';
import type {
  FeishuAgentActionRequest,
  V11DataSourceConfig,
  V11AssessmentConfig,
  V11SubmitRequest,
  V11ReviewDto,
  V11TrainingResource,
} from '@shared/api.interface';

@Controller('api/v11')
export class V11Controller {
  constructor(private readonly v11Service: V11Service) {}

  @Get('data-source/status')
  getDataSourceStatus() {
    return this.v11Service.getDataSourceStatus();
  }

  @Get('data-source/config')
  getDataSourceConfig() {
    return this.v11Service.getDataSourceConfig();
  }

  @Post('data-source/config')
  updateDataSourceConfig(@Body() dto: Partial<V11DataSourceConfig>) {
    return this.v11Service.updateDataSourceConfig(dto);
  }

  @Get('admin/schema-guide')
  getSchemaGuide() {
    return this.v11Service.getSchemaGuide();
  }

  @Get('admin/config')
  getConfig() {
    return this.v11Service.getConfig();
  }

  @Put('admin/config')
  updateConfig(@Body() dto: Partial<V11AssessmentConfig>) {
    return this.v11Service.updateConfig(dto);
  }

  @Get('dimensions')
  getDimensions() {
    return this.v11Service.getDimensions();
  }

  @Get('basic-questions')
  getBasicQuestions() {
    return this.v11Service.getBasicQuestions();
  }

  @Get('task-questions')
  getTaskQuestions() {
    return this.v11Service.getTaskQuestions();
  }

  @Get('interest-questions')
  getInterestQuestions() {
    return this.v11Service.getInterestQuestions();
  }

  @Post('evaluations/submit')
  submitEvaluation(@Body() dto: V11SubmitRequest) {
    return this.v11Service.submitEvaluation(dto);
  }

  @Get('admin/evaluations')
  listEvaluations(@Query('status') status?: string) {
    return this.v11Service.listEvaluations(status);
  }

  @Get('admin/evaluations/:recordId')
  getEvaluationDetail(@Param('recordId') recordId: string) {
    return this.v11Service.getEvaluationDetail(recordId);
  }

  @Put('admin/evaluations/:recordId/review')
  saveReview(@Param('recordId') recordId: string, @Body() dto: V11ReviewDto) {
    return this.v11Service.saveReview(recordId, dto);
  }

  @Post('admin/evaluations/:recordId/generate-report')
  generateReport(@Param('recordId') recordId: string) {
    return this.v11Service.generateReport(recordId);
  }

  @Get('admin/reports')
  listReports() {
    return this.v11Service.getReports();
  }

  @Get('admin/feishu-agent/status')
  getFeishuAgentStatus() {
    return this.v11Service.getFeishuAgentStatus();
  }

  @Post('admin/feishu-agent/actions')
  runFeishuAgentAction(@Body() dto: FeishuAgentActionRequest) {
    return this.v11Service.runFeishuAgentAction(dto);
  }

  @Post('data-source/test-connection')
  testConnection() {
    return this.v11Service.testConnection();
  }

  @Post('data-source/check-schema')
  checkSchema() {
    return this.v11Service.checkSchema();
  }

  @Post('data-source/sync-seed')
  syncSeedData() {
    return this.v11Service.syncSeedData();
  }

  @Get('admin/training-resources')
  listTrainingResources() {
    return this.v11Service.getTrainingResources();
  }

  @Post('admin/training-resources')
  createTrainingResource(@Body() dto: Omit<V11TrainingResource, 'id'>) {
    return this.v11Service.createTrainingResource(dto);
  }

  @Put('admin/training-resources/:id')
  updateTrainingResource(@Param('id') id: string, @Body() dto: Partial<V11TrainingResource>) {
    return this.v11Service.updateTrainingResource(id, dto);
  }

  @Delete('admin/training-resources/:id')
  deleteTrainingResource(@Param('id') id: string) {
    return this.v11Service.deleteTrainingResource(id);
  }
}
