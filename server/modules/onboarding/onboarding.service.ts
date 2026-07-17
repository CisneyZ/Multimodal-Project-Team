import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, and, asc, desc } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import {
  onboardingMaterials,
  onboardingRuleQuestions,
  onboardingProgress,
  onboardingRuleAnswers,
  tongZhiJiLuBiao,
} from '@server/database/schema';
import type {
  OnboardingMaterial,
  OnboardingRuleQuestion,
  RuleQuestionOption,
  OnboardingProgressItem,
  OnboardingRuleAnswerItem,
  OnboardingStatus,
  StartOnboardingRequest,
  SubmitRuleTestRequest,
  SubmitRuleTestResponse,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateRuleQuestionRequest,
  UpdateRuleQuestionRequest,
} from '@shared/api.interface';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getMaterials(type?: string): Promise<OnboardingMaterial[]> {
    const whereClause = type
      ? and(eq(onboardingMaterials.isEnabled, true), eq(onboardingMaterials.materialType, type))
      : eq(onboardingMaterials.isEnabled, true);

    const rows = await this.db
      .select({
        id: onboardingMaterials.id,
        title: onboardingMaterials.title,
        materialType: onboardingMaterials.materialType,
        feishuUrl: onboardingMaterials.feishuUrl,
        description: onboardingMaterials.description,
        sortOrder: onboardingMaterials.sortOrder,
        isEnabled: onboardingMaterials.isEnabled,
      })
      .from(onboardingMaterials)
      .where(whereClause)
      .orderBy(asc(onboardingMaterials.sortOrder));

    return rows as OnboardingMaterial[];
  }

  async getRuleQuestions(): Promise<OnboardingRuleQuestion[]> {
    const rows = await this.db
      .select({
        id: onboardingRuleQuestions.id,
        questionText: onboardingRuleQuestions.questionText,
        questionType: onboardingRuleQuestions.questionType,
        options: onboardingRuleQuestions.options,
        correctAnswer: onboardingRuleQuestions.correctAnswer,
        explanation: onboardingRuleQuestions.explanation,
        score: onboardingRuleQuestions.score,
        sortOrder: onboardingRuleQuestions.sortOrder,
        isEnabled: onboardingRuleQuestions.isEnabled,
      })
      .from(onboardingRuleQuestions)
      .where(eq(onboardingRuleQuestions.isEnabled, true))
      .orderBy(asc(onboardingRuleQuestions.sortOrder));

    return rows.map((row) => ({
      ...row,
      questionType: row.questionType as OnboardingRuleQuestion['questionType'],
      options: row.options ? JSON.parse(row.options) as RuleQuestionOption[] : null,
    }));
  }

  async startProgress(dto: StartOnboardingRequest): Promise<OnboardingProgressItem> {
    const existing = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.newcomerName, dto.newcomerName))
      .limit(1);

    if (existing.length > 0) {
      return this.mapProgress(existing[0]);
    }

    const result = await this.db
      .insert(onboardingProgress)
      .values({
        newcomerName: dto.newcomerName,
        targetRole: dto.targetRole,
        assessmentRecordId: dto.assessmentRecordId ?? null,
        status: 'background_pending',
      })
      .returning();

    return this.mapProgress(result[0]);
  }

  async completeBackground(progressId: string): Promise<OnboardingProgressItem> {
    const result = await this.db
      .update(onboardingProgress)
      .set({
        backgroundCompletedAt: new Date(),
        status: 'background_done',
      })
      .where(eq(onboardingProgress.id, progressId))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    const progress = result[0];
    await this.createNotification(
      'onboarding_background_completed',
      'admin',
      `新人 ${progress.newcomerName} 已完成项目背景阅读`,
      `新人 ${progress.newcomerName}（目标岗位：${progress.targetRole}）已完成项目背景材料阅读，请了解情况并安排规范文档阅读。`,
      progressId,
    );

    return this.mapProgress(progress);
  }

  async completeRules(progressId: string): Promise<OnboardingProgressItem> {
    const result = await this.db
      .update(onboardingProgress)
      .set({
        rulesCompletedAt: new Date(),
        status: 'rules_done',
      })
      .where(eq(onboardingProgress.id, progressId))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    return this.mapProgress(result[0]);
  }

  async submitRuleTest(dto: SubmitRuleTestRequest): Promise<SubmitRuleTestResponse> {
    const progressRows = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.id, dto.progressId))
      .limit(1);

    if (progressRows.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    const progress = progressRows[0];
    const details: OnboardingRuleAnswerItem[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const ans of dto.answers) {
      const questionRows = await this.db
        .select()
        .from(onboardingRuleQuestions)
        .where(eq(onboardingRuleQuestions.id, ans.questionId))
        .limit(1);

      if (questionRows.length === 0) {
        this.logger.log(`Question not found: ${ans.questionId}`);
        continue;
      }

      const question = questionRows[0];
      const isCorrect = ans.answer === question.correctAnswer;
      const score = isCorrect ? question.score : 0;

      totalScore += score;
      maxScore += question.score;

      await this.db.insert(onboardingRuleAnswers).values({
        progressId: dto.progressId,
        questionId: ans.questionId,
        answer: ans.answer,
        score,
        isCorrect,
        explanation: question.explanation,
      });

      details.push({
        progressId: dto.progressId,
        questionId: ans.questionId,
        answer: ans.answer,
        score,
        isCorrect,
        explanation: question.explanation,
      });
    }

    await this.db
      .update(onboardingProgress)
      .set({
        ruleTestCompletedAt: new Date(),
        ruleTestScore: totalScore,
        status: 'rule_test_done',
      })
      .where(eq(onboardingProgress.id, dto.progressId));

    await this.createNotification(
      'onboarding_rule_test_completed',
      'admin',
      `新人 ${progress.newcomerName} 已完成规则测试`,
      `${progress.newcomerName} 已完成规则测试，得分 ${totalScore}/${maxScore}，请安排下一步操作。`,
      dto.progressId,
    );

    return { totalScore, maxScore, details };
  }

  async getAdminMaterials(): Promise<OnboardingMaterial[]> {
    const rows = await this.db
      .select({
        id: onboardingMaterials.id,
        title: onboardingMaterials.title,
        materialType: onboardingMaterials.materialType,
        feishuUrl: onboardingMaterials.feishuUrl,
        description: onboardingMaterials.description,
        sortOrder: onboardingMaterials.sortOrder,
        isEnabled: onboardingMaterials.isEnabled,
      })
      .from(onboardingMaterials)
      .orderBy(asc(onboardingMaterials.sortOrder));

    return rows as OnboardingMaterial[];
  }

  async createMaterial(dto: CreateMaterialRequest): Promise<OnboardingMaterial> {
    const result = await this.db
      .insert(onboardingMaterials)
      .values({
        title: dto.title,
        materialType: dto.materialType,
        feishuUrl: dto.feishuUrl,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isEnabled: dto.isEnabled ?? true,
      })
      .returning();

    return result[0] as OnboardingMaterial;
  }

  async updateMaterial(id: string, dto: UpdateMaterialRequest): Promise<OnboardingMaterial> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.materialType !== undefined) updateData.materialType = dto.materialType;
    if (dto.feishuUrl !== undefined) updateData.feishuUrl = dto.feishuUrl;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;

    const result = await this.db
      .update(onboardingMaterials)
      .set(updateData)
      .where(eq(onboardingMaterials.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Material not found');
    }

    return result[0] as OnboardingMaterial;
  }

  async getAdminRuleQuestions(): Promise<OnboardingRuleQuestion[]> {
    const rows = await this.db
      .select({
        id: onboardingRuleQuestions.id,
        questionText: onboardingRuleQuestions.questionText,
        questionType: onboardingRuleQuestions.questionType,
        options: onboardingRuleQuestions.options,
        correctAnswer: onboardingRuleQuestions.correctAnswer,
        explanation: onboardingRuleQuestions.explanation,
        score: onboardingRuleQuestions.score,
        sortOrder: onboardingRuleQuestions.sortOrder,
        isEnabled: onboardingRuleQuestions.isEnabled,
      })
      .from(onboardingRuleQuestions)
      .orderBy(asc(onboardingRuleQuestions.sortOrder));

    return rows.map((row) => ({
      ...row,
      questionType: row.questionType as OnboardingRuleQuestion['questionType'],
      options: row.options ? JSON.parse(row.options) as RuleQuestionOption[] : null,
    }));
  }

  async createRuleQuestion(dto: CreateRuleQuestionRequest): Promise<OnboardingRuleQuestion> {
    const result = await this.db
      .insert(onboardingRuleQuestions)
      .values({
        questionText: dto.questionText,
        questionType: dto.questionType,
        options: dto.options ? JSON.stringify(dto.options) : null,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation ?? null,
        score: dto.score ?? 10,
        sortOrder: dto.sortOrder ?? 0,
        isEnabled: dto.isEnabled ?? true,
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      questionText: row.questionText,
      questionType: row.questionType as OnboardingRuleQuestion['questionType'],
      options: row.options ? JSON.parse(row.options) as RuleQuestionOption[] : null,
      correctAnswer: row.correctAnswer,
      explanation: row.explanation,
      score: row.score,
      sortOrder: row.sortOrder,
      isEnabled: row.isEnabled,
    };
  }

  async updateRuleQuestion(id: string, dto: UpdateRuleQuestionRequest): Promise<OnboardingRuleQuestion> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.questionText !== undefined) updateData.questionText = dto.questionText;
    if (dto.questionType !== undefined) updateData.questionType = dto.questionType;
    if (dto.options !== undefined) updateData.options = JSON.stringify(dto.options);
    if (dto.correctAnswer !== undefined) updateData.correctAnswer = dto.correctAnswer;
    if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
    if (dto.score !== undefined) updateData.score = dto.score;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;

    const result = await this.db
      .update(onboardingRuleQuestions)
      .set(updateData)
      .where(eq(onboardingRuleQuestions.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Rule question not found');
    }

    const row = result[0];
    return {
      id: row.id,
      questionText: row.questionText,
      questionType: row.questionType as OnboardingRuleQuestion['questionType'],
      options: row.options ? JSON.parse(row.options) as RuleQuestionOption[] : null,
      correctAnswer: row.correctAnswer,
      explanation: row.explanation,
      score: row.score,
      sortOrder: row.sortOrder,
      isEnabled: row.isEnabled,
    };
  }

  async getAdminProgress(): Promise<OnboardingProgressItem[]> {
    const rows = await this.db
      .select()
      .from(onboardingProgress)
      .orderBy(desc(onboardingProgress.createdAt));

    return rows.map((row) => this.mapProgress(row));
  }

  async advanceToRules(progressId: string): Promise<OnboardingProgressItem> {
    const rows = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.id, progressId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    const progress = rows[0];
    if (progress.status !== 'background_done') {
      throw new BadRequestException(
        `Cannot advance: current status is ${progress.status}, expected background_done`,
      );
    }

    const result = await this.db
      .update(onboardingProgress)
      .set({
        status: 'rules_pending',
        updatedAt: new Date(),
      })
      .where(eq(onboardingProgress.id, progressId))
      .returning();

    await this.createNotification(
      'rules_document_released',
      'newcomer',
      '规范文档已发放',
      `管理员已为 ${progress.newcomerName} 发放规范文档，请前往完成阅读。`,
      progressId,
    );

    return this.mapProgress(result[0]);
  }

  async getProgressById(progressId: string): Promise<OnboardingProgressItem> {
    const rows = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.id, progressId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    return this.mapProgress(rows[0]);
  }

  async getPendingProgress(): Promise<OnboardingProgressItem[]> {
    const rows = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.status, 'background_done'))
      .orderBy(asc(onboardingProgress.updatedAt));

    return rows.map((row) => this.mapProgress(row));
  }

  private async createNotification(
    type: string,
    role: string,
    title: string,
    content: string,
    progressId: string,
  ): Promise<void> {
    await this.db.insert(tongZhiJiLuBiao).values({
      tongZhiLeiXing: type,
      jieShouJiaoSe: role,
      guanLianJiLu: progressId,
      biaoTi: title,
      neiRong: content,
      zhuangTai: '未发送',
    });
    this.logger.log(`Notification created: ${title}`);
  }

  private mapProgress(row: Record<string, unknown>): OnboardingProgressItem {
    return {
      id: row.id as string,
      newcomerName: row.newcomerName as string,
      targetRole: row.targetRole as string,
      assessmentRecordId: (row.assessmentRecordId as string) ?? null,
      backgroundCompletedAt: row.backgroundCompletedAt
        ? row.backgroundCompletedAt instanceof Date
          ? row.backgroundCompletedAt.toISOString()
          : String(row.backgroundCompletedAt)
        : null,
      rulesCompletedAt: row.rulesCompletedAt
        ? row.rulesCompletedAt instanceof Date
          ? row.rulesCompletedAt.toISOString()
          : String(row.rulesCompletedAt)
        : null,
      ruleTestCompletedAt: row.ruleTestCompletedAt
        ? row.ruleTestCompletedAt instanceof Date
          ? row.ruleTestCompletedAt.toISOString()
          : String(row.ruleTestCompletedAt)
        : null,
      ruleTestScore: (row.ruleTestScore as number) ?? null,
      status: row.status as OnboardingStatus,
    };
  }
}
