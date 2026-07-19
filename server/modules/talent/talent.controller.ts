import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TalentService } from './talent.service';
import { phase1AnalysisRequestSchema, type Phase1AnalysisRequestDto } from './talent.dto';

@Controller('api/talent')
export class TalentController {
  constructor(private readonly service: TalentService) {}

  @Get('dashboard')
  dashboard() { return this.service.dashboard(); }

  @Get('projects')
  listProjects() { return this.service.listProjects(); }

  @Post('projects')
  createProject(@Body() body: any) { return this.service.createProject(body); }

  @Put('projects/:projectId')
  updateProject(@Param('projectId') projectId: string, @Body() body: any) { return this.service.updateProject(projectId, body); }

  @Post('projects/:projectId/import-document')
  importDocument(@Param('projectId') projectId: string, @Body() body: any) { return this.service.importDocument(projectId, body); }

  @Post('projects/:projectId/confirm')
  confirmProject(@Param('projectId') projectId: string) { return this.service.confirmProject(projectId); }

  @Get('candidates')
  listCandidates() { return this.service.listCandidates(); }

  @Post('candidates')
  createCandidate(@Body() body: any) { return this.service.createCandidate(body); }

  @Post('candidates/:candidateId/analyze')
  analyzeCandidate(@Param('candidateId') candidateId: string) { return this.service.analyzeCandidate(candidateId); }

  @Post('candidates/:candidateId/phase1-analyses')
  analyzePhase1(@Param('candidateId') candidateId: string, @Body() body: Phase1AnalysisRequestDto) { return this.service.analyzePhase1(candidateId, phase1AnalysisRequestSchema.parse({ ...body, candidateId })); }

  @Get('candidates/:candidateId/phase1-analyses')
  listPhase1Analyses(@Param('candidateId') candidateId: string) { return this.service.listPhase1Analyses(candidateId); }

  @Post('candidates/:candidateId/match')
  matchCandidate(@Param('candidateId') candidateId: string) { return this.service.matchCandidate(candidateId); }

  @Post('candidates/:candidateId/assessments')
  createAssessment(@Param('candidateId') candidateId: string, @Body() body: any, @Query('projectId') projectId?: string) {
    return this.service.createAssessment(candidateId, body?.projectId || projectId);
  }

  @Post('candidates/:candidateId/add-to-pool')
  addToPool(@Param('candidateId') candidateId: string) { return this.service.addToPool(candidateId); }

  @Get('assessments/:assessmentId')
  getAssessment(@Param('assessmentId') assessmentId: string) { return this.service.getAssessment(assessmentId); }

  @Post('assessments/:assessmentId/answers')
  submitAnswers(@Param('assessmentId') assessmentId: string, @Body() body: any) { return this.service.submitAnswers(assessmentId, body); }

  @Put('assessments/:assessmentId/review')
  reviewAssessment(@Param('assessmentId') assessmentId: string, @Body() body: any) { return this.service.reviewAssessment(assessmentId, body); }

  @Post('assessments/:assessmentId/report')
  generateReport(@Param('assessmentId') assessmentId: string) { return this.service.generateReport(assessmentId); }

  @Get('reports')
  reports() { return this.service.listReports(); }

  @Post('reset-demo')
  resetDemo() { return this.service.resetDemo(); }
}
