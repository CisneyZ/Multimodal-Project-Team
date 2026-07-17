import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { OnboardingService } from './onboarding.service';
import { ChatService } from './chat.service';
import type {
  StartOnboardingRequest,
  SubmitRuleTestRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateRuleQuestionRequest,
  UpdateRuleQuestionRequest,
  ChatMessageRequest,
  RemindAdminRequest,
} from '@shared/api.interface';

@Controller('api/onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly chatService: ChatService,
  ) {}

  @Get('materials')
  getMaterials(@Query('type') type?: string) {
    return this.onboardingService.getMaterials(type);
  }

  @Get('rule-questions')
  getRuleQuestions() {
    return this.onboardingService.getRuleQuestions();
  }

  @NeedLogin()
  @Post('progress/start')
  startProgress(@Body() dto: StartOnboardingRequest) {
    return this.onboardingService.startProgress(dto);
  }

  @NeedLogin()
  @Post('progress/background-complete')
  completeBackground(@Body('progressId') progressId: string) {
    return this.onboardingService.completeBackground(progressId);
  }

  @NeedLogin()
  @Post('progress/rules-complete')
  completeRules(@Body('progressId') progressId: string) {
    return this.onboardingService.completeRules(progressId);
  }

  @NeedLogin()
  @Post('rule-test/submit')
  submitRuleTest(@Body() dto: SubmitRuleTestRequest) {
    return this.onboardingService.submitRuleTest(dto);
  }

  @Get('progress/:id')
  getProgressById(@Param('id') id: string) {
    return this.onboardingService.getProgressById(id);
  }

  @Get('admin/progress/pending')
  getPendingProgress() {
    return this.onboardingService.getPendingProgress();
  }

  @Get('admin/materials')
  getAdminMaterials() {
    return this.onboardingService.getAdminMaterials();
  }

  @NeedLogin()
  @Post('admin/materials')
  createMaterial(@Body() dto: CreateMaterialRequest) {
    return this.onboardingService.createMaterial(dto);
  }

  @NeedLogin()
  @Put('admin/materials/:id')
  updateMaterial(@Param('id') id: string, @Body() dto: UpdateMaterialRequest) {
    return this.onboardingService.updateMaterial(id, dto);
  }

  @Get('admin/rule-questions')
  getAdminRuleQuestions() {
    return this.onboardingService.getAdminRuleQuestions();
  }

  @NeedLogin()
  @Post('admin/rule-questions')
  createRuleQuestion(@Body() dto: CreateRuleQuestionRequest) {
    return this.onboardingService.createRuleQuestion(dto);
  }

  @NeedLogin()
  @Put('admin/rule-questions/:id')
  updateRuleQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateRuleQuestionRequest,
  ) {
    return this.onboardingService.updateRuleQuestion(id, dto);
  }

  @NeedLogin()
  @Post('admin/progress/:id/advance-rules')
  advanceToRules(@Param('id') id: string) {
    return this.onboardingService.advanceToRules(id);
  }

  @Get('admin/progress')
  getAdminProgress() {
    return this.onboardingService.getAdminProgress();
  }

  @Get('chat/bootstrap')
  getChatBootstrap(@Query('progressId') progressId?: string) {
    return this.chatService.getBootstrap(progressId);
  }

  @NeedLogin()
  @Post('chat/message')
  sendChatMessage(@Body() dto: ChatMessageRequest) {
    return this.chatService.replyToMessage(dto.progressId, dto.message);
  }

  @NeedLogin()
  @Post('chat/remind-admin')
  remindAdmin(@Body() dto: RemindAdminRequest) {
    return this.chatService.remindAdmin(dto.progressId);
  }

  @Get('admin/chat-flows')
  getChatFlows() {
    return this.chatService.getChatFlows();
  }

  @Get('admin/chat-phrases')
  getChatPhrases() {
    return this.chatService.getChatPhrases();
  }
}
