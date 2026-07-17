import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, desc, count, sql, and, inArray } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import {
  nengLiWeiDuBiao,
  tiKuBiao,
  pingFenGuiZeBiao,
  peiXunZiYuanBiao,
  cePingJiLuBiao,
  daTiMingXiBiao,
  tongZhiJiLuBiao,
} from '@server/database/schema';
import { ScoringService } from './scoring.service';
import { AiScoringService } from './ai-scoring.service';
import { NotificationService } from './notification.service';
import type {
  DimensionItem,
  QuestionForExam,
  QuestionItem,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  ScoringRuleItem,
  TrainingResourceItem,
  AssessmentRecord,
  AssessmentStats,
  PaginatedResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  DimensionScore,
  AnswerDetail,
  GradeLevel,
  ReviewDetailItem,
  CompleteReviewRequest,
  CompleteReviewResponse,
  NotificationItem,
  RecordDetail,
  AnswerDetailItem,
  AiScoringStatus,
  ScoringSource,
} from '@shared/api.interface';

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly scoringService: ScoringService,
    private readonly aiScoringService: AiScoringService,
    private readonly notificationService: NotificationService,
  ) {}

  async getDimensions(): Promise<DimensionItem[]> {
    const rows = await this.db.select().from(nengLiWeiDuBiao).orderBy(nengLiWeiDuBiao.paiXu);
    return rows.map((r) => ({
      id: r.id,
      dimensionCode: r.weiDuBianMa,
      dimensionName: r.weiDuMingCheng,
      dimensionDescription: r.weiDuShuoMing,
      lowScoreSuggestion: r.diFenJianYi,
      midScoreSuggestion: r.zhongFenJianYi,
      highScoreSuggestion: r.gaoFenJianYi,
      sortOrder: r.paiXu,
    }));
  }

  async getExamQuestions(): Promise<QuestionForExam[]> {
    const rows = await this.db
      .select({
        id: tiKuBiao.id,
        questionNumber: tiKuBiao.tiMuBianHao,
        questionType: tiKuBiao.tiXing,
        stem: tiKuBiao.tiGan,
        optionA: tiKuBiao.xuanXiangA,
        optionB: tiKuBiao.xuanXiangB,
        optionC: tiKuBiao.xuanXiangC,
        optionD: tiKuBiao.xuanXiangD,
        points: tiKuBiao.fenZhi,
        difficulty: tiKuBiao.nanDu,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
      })
      .from(tiKuBiao)
      .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .where(eq(tiKuBiao.shiFouQiYong, true))
      .orderBy(tiKuBiao.tiMuBianHao);
    return rows;
  }

  async submitAssessment(dto: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse> {
    const allQuestions = await this.db
      .select({
        id: tiKuBiao.id,
        questionNumber: tiKuBiao.tiMuBianHao,
        questionType: tiKuBiao.tiXing,
        stem: tiKuBiao.tiGan,
        correctAnswer: tiKuBiao.biaoZhunDaAn,
        scoringKeywords: tiKuBiao.pingFenGuanJianCi,
        points: tiKuBiao.fenZhi,
        dimensionId: tiKuBiao.suoShuWeiDu,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
        lowScoreSuggestion: nengLiWeiDuBiao.diFenJianYi,
      })
      .from(tiKuBiao)
      .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .where(eq(tiKuBiao.shiFouQiYong, true));

    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    const answerDetails: AnswerDetail[] = [];
    const dimScoreMap = new Map<string, { total: number; max: number; code: string; name: string; suggestion: string | null }>();

    for (const ans of dto.answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      let scoreResult;
      if (q.questionType === '单选' || q.questionType === '判断') {
        scoreResult = this.scoringService.scoreObjective(q.correctAnswer ?? '', ans.answer, q.points);
      } else {
        scoreResult = await this.aiScoringService.scoreSubjective(q.scoringKeywords, q.stem, ans.answer, q.points, 0.65);
      }

      answerDetails.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        stem: q.stem,
        dimensionName: q.dimensionName,
        submittedAnswer: ans.answer,
        autoScore: scoreResult.score,
        maxScore: q.points,
        scoringReason: scoreResult.reason,
        confidence: scoreResult.confidence,
        needsReview: scoreResult.needsReview,
      });

      const existing = dimScoreMap.get(q.dimensionCode);
      if (existing) {
        existing.total += scoreResult.score;
        existing.max += q.points;
      } else {
        dimScoreMap.set(q.dimensionCode, {
          total: scoreResult.score,
          max: q.points,
          code: q.dimensionCode,
          name: q.dimensionName,
          suggestion: q.lowScoreSuggestion,
        });
      }
    }

    const dimensions: DimensionScore[] = [];
    for (const [, ds] of dimScoreMap) {
      const pct = ds.max > 0 ? Math.round((ds.total / ds.max) * 100) : 0;
      dimensions.push({
        dimensionCode: ds.code,
        dimensionName: ds.name,
        score: ds.total,
        maxScore: ds.max,
        percentage: pct,
        suggestion: pct < 60 ? ds.suggestion : null,
      });
    }

    dimensions.sort((a, b) => a.percentage - b.percentage);
    const weakDimensions = dimensions.filter((d) => d.percentage < 60).map((d) => d.dimensionCode);

    const totalScore = answerDetails.reduce((sum, a) => sum + a.autoScore, 0);
    const maxTotalScore = answerDetails.reduce((sum, a) => sum + a.maxScore, 0);
    const pct = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;
    const grade: GradeLevel = pct >= 85 ? '骨干培养' : pct >= 70 ? '岗位进阶' : pct >= 55 ? '基础执行' : '入门补强';

    const now = new Date();
    const hasReviewNeeded = answerDetails.some((d) => d.needsReview);
    const initialStatus = hasReviewNeeded ? '待复核' : '已完成';
    const recordResult = await this.db
      .insert(cePingJiLuBiao)
      .values({
        xinRenXingMing: dto.name,
        muBiaoGangWei: dto.position,
        cePingZhuangTai: initialStatus,
        yingShiJiChuLiLunDeFen: dimScoreMap.get('theory')?.total ?? null,
        shiTingYuYanYingYongDeFen: dimScoreMap.get('language')?.total ?? null,
        juBenXuShiChaiJieDeFen: dimScoreMap.get('script')?.total ?? null,
        aIGCYeWuRenZhiDeFen: dimScoreMap.get('aigc')?.total ?? null,
        zongHeFenXiNengLiDeFen: dimScoreMap.get('analysis')?.total ?? null,
        zongFen: totalScore,
        tuiJianDangWei: grade,
        baoRuoWeiDu: weakDimensions.length > 0 ? (dimensions[0]?.percentage < 50 ? '4' : '2') : null,
        tiJiaoShiJian: now.toISOString().split('T')[1].split('.')[0],
      })
      .returning({ id: cePingJiLuBiao.id });

    const assessmentId = recordResult[0]?.id;

    if (assessmentId) {
      const detailValues = answerDetails.map((ad) => ({
        cePingJiLu: assessmentId,
        tiMu: ad.questionId,
        xinRenDaAn: ad.submittedAnswer,
        ziDongDeFen: ad.autoScore,
        pingFenLiYou: ad.scoringReason,
        zhiXinDu: ad.confidence,
        shiFouXuYaoFuHe: ad.needsReview,
        suoShuWeiDuKuaiZhao: ad.dimensionName,
        manFenKuaiZhao: ad.maxScore,
      }));
      await this.db.insert(daTiMingXiBiao).values(detailValues);
    }

    const strongDims = dimensions.filter((d) => d.percentage >= 80).map((d) => d.dimensionName).join('、');
    const weakNames = dimensions.filter((d) => weakDimensions.includes(d.dimensionCode)).map((d) => `${d.dimensionName}(${d.score}/${d.maxScore})`).join('、');
    const aiSummary = [
      `${dto.name}（${dto.position}）完成本次能力评估，总分 ${totalScore}/${maxTotalScore}（${Math.round(pct)}%），推荐档位：${grade}。`,
      strongDims ? `优势维度：${strongDims}。` : '',
      weakNames ? `薄弱维度：${weakNames}，建议针对性加强培训。` : '各维度表现均衡，可继续深化专业能力提升。',
    ].filter(Boolean).join('');

    await this.notificationService.create(
      'submission_completed',
      'admin',
      assessmentId ?? null,
      `新测评提交：${dto.name}`,
      `${dto.name}（${dto.position}）完成测评，总分 ${totalScore}/${maxTotalScore}，推荐档位：${grade}`,
    );
    if (hasReviewNeeded) {
      const reviewCount = answerDetails.filter((d) => d.needsReview).length;
      await this.notificationService.create(
        'review_needed',
        'reviewer',
        assessmentId ?? null,
        `待人工复核：${dto.name}`,
        `${dto.name} 的测评中有 ${reviewCount} 道主观题需要人工复核`,
      );
    }

    return {
      assessmentId: assessmentId ?? '',
      totalScore,
      maxTotalScore,
      grade,
      dimensions,
      weakDimensions,
      answerDetails,
      aiSummary,
    };
  }

  async getQuestions(page: number, pageSize: number): Promise<PaginatedResponse<QuestionItem>> {
    const offset = (page - 1) * pageSize;
    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          id: tiKuBiao.id,
          questionNumber: tiKuBiao.tiMuBianHao,
          dimensionId: tiKuBiao.suoShuWeiDu,
          questionType: tiKuBiao.tiXing,
          stem: tiKuBiao.tiGan,
          optionA: tiKuBiao.xuanXiangA,
          optionB: tiKuBiao.xuanXiangB,
          optionC: tiKuBiao.xuanXiangC,
          optionD: tiKuBiao.xuanXiangD,
          correctAnswer: tiKuBiao.biaoZhunDaAn,
          scoringKeywords: tiKuBiao.pingFenGuanJianCi,
          points: tiKuBiao.fenZhi,
          difficulty: tiKuBiao.nanDu,
          isEnabled: tiKuBiao.shiFouQiYong,
          dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
          dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
        })
        .from(tiKuBiao)
        .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
        .orderBy(tiKuBiao.tiMuBianHao)
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(tiKuBiao),
    ]);
    return { items: rows, total: totalResult[0]?.count ?? 0, page, pageSize };
  }

  async createQuestion(dto: CreateQuestionRequest): Promise<QuestionItem> {
    const result = await this.db
      .insert(tiKuBiao)
      .values({
        tiMuBianHao: dto.questionNumber,
        suoShuWeiDu: dto.dimensionId,
        tiXing: dto.questionType,
        tiGan: dto.stem,
        xuanXiangA: dto.optionA ?? null,
        xuanXiangB: dto.optionB ?? null,
        xuanXiangC: dto.optionC ?? null,
        xuanXiangD: dto.optionD ?? null,
        biaoZhunDaAn: dto.correctAnswer ?? null,
        pingFenGuanJianCi: dto.scoringKeywords ?? null,
        fenZhi: dto.points,
        nanDu: dto.difficulty,
      })
      .returning({ id: tiKuBiao.id });

    const created = await this.db
      .select({
        id: tiKuBiao.id,
        questionNumber: tiKuBiao.tiMuBianHao,
        dimensionId: tiKuBiao.suoShuWeiDu,
        questionType: tiKuBiao.tiXing,
        stem: tiKuBiao.tiGan,
        optionA: tiKuBiao.xuanXiangA,
        optionB: tiKuBiao.xuanXiangB,
        optionC: tiKuBiao.xuanXiangC,
        optionD: tiKuBiao.xuanXiangD,
        correctAnswer: tiKuBiao.biaoZhunDaAn,
        scoringKeywords: tiKuBiao.pingFenGuanJianCi,
        points: tiKuBiao.fenZhi,
        difficulty: tiKuBiao.nanDu,
        isEnabled: tiKuBiao.shiFouQiYong,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
      })
      .from(tiKuBiao)
      .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .where(eq(tiKuBiao.id, result[0].id));

    return created[0];
  }

  async updateQuestion(id: string, dto: UpdateQuestionRequest): Promise<QuestionItem | null> {
    const updateData: Record<string, unknown> = {};
    if (dto.questionNumber !== undefined) updateData.tiMuBianHao = dto.questionNumber;
    if (dto.dimensionId !== undefined) updateData.suoShuWeiDu = dto.dimensionId;
    if (dto.questionType !== undefined) updateData.tiXing = dto.questionType;
    if (dto.stem !== undefined) updateData.tiGan = dto.stem;
    if (dto.optionA !== undefined) updateData.xuanXiangA = dto.optionA;
    if (dto.optionB !== undefined) updateData.xuanXiangB = dto.optionB;
    if (dto.optionC !== undefined) updateData.xuanXiangC = dto.optionC;
    if (dto.optionD !== undefined) updateData.xuanXiangD = dto.optionD;
    if (dto.correctAnswer !== undefined) updateData.biaoZhunDaAn = dto.correctAnswer;
    if (dto.scoringKeywords !== undefined) updateData.pingFenGuanJianCi = dto.scoringKeywords;
    if (dto.points !== undefined) updateData.fenZhi = dto.points;
    if (dto.difficulty !== undefined) updateData.nanDu = dto.difficulty;
    if (dto.isEnabled !== undefined) updateData.shiFouQiYong = dto.isEnabled;

    if (Object.keys(updateData).length === 0) return null;

    await this.db.update(tiKuBiao).set(updateData).where(eq(tiKuBiao.id, id));

    const updated = await this.db
      .select({
        id: tiKuBiao.id,
        questionNumber: tiKuBiao.tiMuBianHao,
        dimensionId: tiKuBiao.suoShuWeiDu,
        questionType: tiKuBiao.tiXing,
        stem: tiKuBiao.tiGan,
        optionA: tiKuBiao.xuanXiangA,
        optionB: tiKuBiao.xuanXiangB,
        optionC: tiKuBiao.xuanXiangC,
        optionD: tiKuBiao.xuanXiangD,
        correctAnswer: tiKuBiao.biaoZhunDaAn,
        scoringKeywords: tiKuBiao.pingFenGuanJianCi,
        points: tiKuBiao.fenZhi,
        difficulty: tiKuBiao.nanDu,
        isEnabled: tiKuBiao.shiFouQiYong,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
      })
      .from(tiKuBiao)
      .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .where(eq(tiKuBiao.id, id));

    return updated[0] ?? null;
  }

  async getScoringRules(): Promise<ScoringRuleItem[]> {
    return this.db
      .select({
        id: pingFenGuiZeBiao.id,
        dimensionId: pingFenGuiZeBiao.suoShuWeiDu,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        questionType: pingFenGuiZeBiao.tiXing,
        scoringCriteria: pingFenGuiZeBiao.pingFenBiaoZhun,
        highScoreExample: pingFenGuiZeBiao.gaoFenYangLi,
        midScoreExample: pingFenGuiZeBiao.zhongFenYangLi,
        lowScoreExample: pingFenGuiZeBiao.diFenYangLi,
        reviewThreshold: pingFenGuiZeBiao.renGongFuHeYuZhi,
      })
      .from(pingFenGuiZeBiao)
      .innerJoin(nengLiWeiDuBiao, eq(pingFenGuiZeBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .orderBy(nengLiWeiDuBiao.paiXu);
  }

  async getTrainingResources(): Promise<TrainingResourceItem[]> {
    return this.db
      .select({
        id: peiXunZiYuanBiao.id,
        dimensionId: peiXunZiYuanBiao.suoShuWeiDu,
        dimensionName: nengLiWeiDuBiao.weiDuMingCheng,
        dimensionCode: nengLiWeiDuBiao.weiDuBianMa,
        resourceName: peiXunZiYuanBiao.ziYuanMingCheng,
        resourceType: peiXunZiYuanBiao.ziYuanLeiXing,
        applicableGrade: peiXunZiYuanBiao.shiYongDangWei,
        studyDurationDays: peiXunZiYuanBiao.xueXiZhouQi,
        passCriteria: peiXunZiYuanBiao.daBiaoBiaoZhun,
        isEnabled: peiXunZiYuanBiao.shiFouQiYong,
      })
      .from(peiXunZiYuanBiao)
      .innerJoin(nengLiWeiDuBiao, eq(peiXunZiYuanBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
      .orderBy(nengLiWeiDuBiao.paiXu);
  }

  async getAssessmentRecords(page: number, pageSize: number): Promise<PaginatedResponse<AssessmentRecord>> {
    const offset = (page - 1) * pageSize;
    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          id: cePingJiLuBiao.id,
          name: cePingJiLuBiao.xinRenXingMing,
          position: cePingJiLuBiao.muBiaoGangWei,
          status: cePingJiLuBiao.cePingZhuangTai,
          theoryScore: cePingJiLuBiao.yingShiJiChuLiLunDeFen,
          languageScore: cePingJiLuBiao.shiTingYuYanYingYongDeFen,
          scriptScore: cePingJiLuBiao.juBenXuShiChaiJieDeFen,
          aigcScore: cePingJiLuBiao.aIGCYeWuRenZhiDeFen,
          analysisScore: cePingJiLuBiao.zongHeFenXiNengLiDeFen,
          totalScore: cePingJiLuBiao.zongFen,
          recommendedGrade: cePingJiLuBiao.tuiJianDangWei,
          weakDimension: cePingJiLuBiao.baoRuoWeiDu,
          aiSummary: cePingJiLuBiao.zhiNengTiZongJie,
          submitTime: cePingJiLuBiao.tiJiaoShiJian,
          reviewer: cePingJiLuBiao.fuHeRen,
          reviewComment: cePingJiLuBiao.fuHeYiJian,
          createdAt: cePingJiLuBiao.createdAt,
        })
        .from(cePingJiLuBiao)
        .orderBy(desc(cePingJiLuBiao.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(cePingJiLuBiao),
    ]);

    const items: AssessmentRecord[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      status: r.status,
      theoryScore: r.theoryScore,
      languageScore: r.languageScore,
      scriptScore: r.scriptScore,
      aigcScore: r.aigcScore,
      analysisScore: r.analysisScore,
      totalScore: r.totalScore,
      recommendedGrade: r.recommendedGrade,
      weakDimension: r.weakDimension,
      aiSummary: r.aiSummary,
      submitTime: r.submitTime,
      reviewer: r.reviewer,
      reviewComment: r.reviewComment,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));

    return { items, total: totalResult[0]?.count ?? 0, page, pageSize };
  }

  async getAssessmentStats(): Promise<AssessmentStats> {
    const totalResult = await this.db.select({ count: count() }).from(cePingJiLuBiao);
    const totalAssessments = totalResult[0]?.count ?? 0;

    if (totalAssessments === 0) {
      return { totalAssessments: 0, averageScore: 0, gradeDistribution: [], dimensionAverages: [], recentAssessments: [] };
    }

    const avgResult = await this.db
      .select({ avg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.zongFen}), 0)` })
      .from(cePingJiLuBiao);
    const averageScore = Math.round(Number(avgResult[0]?.avg ?? 0));

    const gradeResult = await this.db
      .select({ grade: cePingJiLuBiao.tuiJianDangWei, count: count() })
      .from(cePingJiLuBiao)
      .where(sql`${cePingJiLuBiao.tuiJianDangWei} IS NOT NULL`)
      .groupBy(cePingJiLuBiao.tuiJianDangWei);

    const gradeDistribution = gradeResult.map((r) => ({ grade: r.grade ?? '入门补强' as GradeLevel, count: r.count }));

    const dimAvgResult = await this.db
      .select({
        theoryAvg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.yingShiJiChuLiLunDeFen}), 0)`,
        languageAvg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.shiTingYuYanYingYongDeFen}), 0)`,
        scriptAvg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.juBenXuShiChaiJieDeFen}), 0)`,
        aigcAvg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.aIGCYeWuRenZhiDeFen}), 0)`,
        analysisAvg: sql<number>`COALESCE(AVG(${cePingJiLuBiao.zongHeFenXiNengLiDeFen}), 0)`,
      })
      .from(cePingJiLuBiao);

    const dimAvgs = dimAvgResult[0];
    const dimensionAverages = [
      { dimensionName: '影视基础理论', averageScore: Math.round(Number(dimAvgs?.theoryAvg ?? 0)), maxScore: 16 },
      { dimensionName: '视听语言应用', averageScore: Math.round(Number(dimAvgs?.languageAvg ?? 0)), maxScore: 16 },
      { dimensionName: '剧本叙事拆解', averageScore: Math.round(Number(dimAvgs?.scriptAvg ?? 0)), maxScore: 22 },
      { dimensionName: 'AIGC 业务认知', averageScore: Math.round(Number(dimAvgs?.aigcAvg ?? 0)), maxScore: 22 },
      { dimensionName: '综合分析能力', averageScore: Math.round(Number(dimAvgs?.analysisAvg ?? 0)), maxScore: 12 },
    ];

    const recentRows = await this.db
      .select({
        id: cePingJiLuBiao.id,
        name: cePingJiLuBiao.xinRenXingMing,
        position: cePingJiLuBiao.muBiaoGangWei,
        status: cePingJiLuBiao.cePingZhuangTai,
        theoryScore: cePingJiLuBiao.yingShiJiChuLiLunDeFen,
        languageScore: cePingJiLuBiao.shiTingYuYanYingYongDeFen,
        scriptScore: cePingJiLuBiao.juBenXuShiChaiJieDeFen,
        aigcScore: cePingJiLuBiao.aIGCYeWuRenZhiDeFen,
        analysisScore: cePingJiLuBiao.zongHeFenXiNengLiDeFen,
        totalScore: cePingJiLuBiao.zongFen,
        recommendedGrade: cePingJiLuBiao.tuiJianDangWei,
        weakDimension: cePingJiLuBiao.baoRuoWeiDu,
        aiSummary: cePingJiLuBiao.zhiNengTiZongJie,
        submitTime: cePingJiLuBiao.tiJiaoShiJian,
        reviewer: cePingJiLuBiao.fuHeRen,
        reviewComment: cePingJiLuBiao.fuHeYiJian,
        createdAt: cePingJiLuBiao.createdAt,
      })
      .from(cePingJiLuBiao)
      .orderBy(desc(cePingJiLuBiao.createdAt))
      .limit(10);

    const recentAssessments: AssessmentRecord[] = recentRows.map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      status: r.status,
      theoryScore: r.theoryScore,
      languageScore: r.languageScore,
      scriptScore: r.scriptScore,
      aigcScore: r.aigcScore,
      analysisScore: r.analysisScore,
      totalScore: r.totalScore,
      recommendedGrade: r.recommendedGrade,
      weakDimension: r.weakDimension,
      aiSummary: r.aiSummary,
      submitTime: r.submitTime,
      reviewer: r.reviewer,
      reviewComment: r.reviewComment,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));

    return { totalAssessments, averageScore, gradeDistribution, dimensionAverages, recentAssessments };
  }

  async getReviewDetails(): Promise<ReviewDetailItem[]> {
    const rows = await this.db
      .select({
        id: daTiMingXiBiao.id,
        assessmentId: daTiMingXiBiao.cePingJiLu,
        assessmentName: cePingJiLuBiao.xinRenXingMing,
        questionNumber: tiKuBiao.tiMuBianHao,
        stem: tiKuBiao.tiGan,
        submittedAnswer: daTiMingXiBiao.xinRenDaAn,
        autoScore: daTiMingXiBiao.ziDongDeFen,
        maxScore: daTiMingXiBiao.manFenKuaiZhao,
        scoringReason: daTiMingXiBiao.pingFenLiYou,
        confidence: daTiMingXiBiao.zhiXinDu,
        dimensionName: daTiMingXiBiao.suoShuWeiDuKuaiZhao,
        createdAt: daTiMingXiBiao.createdAt,
      })
      .from(daTiMingXiBiao)
      .innerJoin(cePingJiLuBiao, eq(daTiMingXiBiao.cePingJiLu, cePingJiLuBiao.id))
      .innerJoin(tiKuBiao, eq(daTiMingXiBiao.tiMu, tiKuBiao.id))
      .where(eq(daTiMingXiBiao.shiFouXuYaoFuHe, true))
      .orderBy(tiKuBiao.tiMuBianHao);

    return rows.map((r) => ({
      id: r.id,
      assessmentId: r.assessmentId,
      assessmentName: r.assessmentName,
      questionNumber: r.questionNumber,
      stem: r.stem,
      submittedAnswer: r.submittedAnswer,
      autoScore: r.autoScore ?? 0,
      maxScore: r.maxScore ?? 0,
      scoringReason: r.scoringReason,
      confidence: r.confidence,
      dimensionName: r.dimensionName,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));
  }

  async completeReview(dto: CompleteReviewRequest): Promise<CompleteReviewResponse> {
    const detail = await this.db
      .select({
        id: daTiMingXiBiao.id,
        assessmentId: daTiMingXiBiao.cePingJiLu,
        maxScore: daTiMingXiBiao.manFenKuaiZhao,
      })
      .from(daTiMingXiBiao)
      .where(eq(daTiMingXiBiao.id, dto.detailId))
      .limit(1);

    if (!detail.length) throw new NotFoundException('答题明细不存在');

    await this.db
      .update(daTiMingXiBiao)
      .set({
        ziDongDeFen: dto.reviewedScore,
        pingFenLiYou: dto.reviewedReason,
        shiFouXuYaoFuHe: false,
      })
      .where(eq(daTiMingXiBiao.id, dto.detailId));

    const recordId = detail[0].assessmentId;
    const remaining = await this.db
      .select({ count: count() })
      .from(daTiMingXiBiao)
      .where(and(eq(daTiMingXiBiao.cePingJiLu, recordId), eq(daTiMingXiBiao.shiFouXuYaoFuHe, true)));

    if ((remaining[0]?.count ?? 0) > 0) {
      return { success: true, recordId, recordStatus: '待复核' };
    }

    const allDetails = await this.db
      .select({
        autoScore: daTiMingXiBiao.ziDongDeFen,
        maxScore: daTiMingXiBiao.manFenKuaiZhao,
        dimensionName: daTiMingXiBiao.suoShuWeiDuKuaiZhao,
        questionId: daTiMingXiBiao.tiMu,
      })
      .from(daTiMingXiBiao)
      .where(eq(daTiMingXiBiao.cePingJiLu, recordId));

    const totalScore = allDetails.reduce((sum: number, d) => sum + (d.autoScore ?? 0), 0);
    const maxTotal = allDetails.reduce((sum: number, d) => sum + (d.maxScore ?? 0), 0);
    const pct = maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0;
    const grade: GradeLevel = pct >= 85 ? '骨干培养' : pct >= 70 ? '岗位进阶' : pct >= 55 ? '基础执行' : '入门补强';

    const questionIds = allDetails.map((d) => d.questionId);
    const dimRows = questionIds.length > 0
      ? await this.db
          .select({ id: tiKuBiao.id, dimCode: nengLiWeiDuBiao.weiDuBianMa })
          .from(tiKuBiao)
          .innerJoin(nengLiWeiDuBiao, eq(tiKuBiao.suoShuWeiDu, nengLiWeiDuBiao.id))
          .where(inArray(tiKuBiao.id, questionIds))
      : [];
    const qDimMap = new Map(dimRows.map((r) => [r.id, r.dimCode]));

    const dimScores = new Map<string, number>();
    for (const d of allDetails) {
      const code = qDimMap.get(d.questionId) ?? 'unknown';
      dimScores.set(code, (dimScores.get(code) ?? 0) + (d.autoScore ?? 0));
    }

    await this.db
      .update(cePingJiLuBiao)
      .set({
        cePingZhuangTai: '已复核',
        zongFen: totalScore,
        tuiJianDangWei: grade,
        yingShiJiChuLiLunDeFen: dimScores.get('theory') ?? null,
        shiTingYuYanYingYongDeFen: dimScores.get('language') ?? null,
        juBenXuShiChaiJieDeFen: dimScores.get('script') ?? null,
        aIGCYeWuRenZhiDeFen: dimScores.get('aigc') ?? null,
        zongHeFenXiNengLiDeFen: dimScores.get('analysis') ?? null,
      })
      .where(eq(cePingJiLuBiao.id, recordId));

    await this.notificationService.create(
      'review_completed',
      'admin',
      recordId,
      '复核完成',
      `测评记录已全部复核完成，总分 ${totalScore}，推荐档位：${grade}`,
    );

    return { success: true, recordId, recordStatus: '已复核', totalScore, grade };
  }

  async getRecordDetail(recordId: string): Promise<RecordDetail> {
    const recordRows = await this.db
      .select({
        id: cePingJiLuBiao.id,
        name: cePingJiLuBiao.xinRenXingMing,
        position: cePingJiLuBiao.muBiaoGangWei,
        status: cePingJiLuBiao.cePingZhuangTai,
        theoryScore: cePingJiLuBiao.yingShiJiChuLiLunDeFen,
        languageScore: cePingJiLuBiao.shiTingYuYanYingYongDeFen,
        scriptScore: cePingJiLuBiao.juBenXuShiChaiJieDeFen,
        aigcScore: cePingJiLuBiao.aIGCYeWuRenZhiDeFen,
        analysisScore: cePingJiLuBiao.zongHeFenXiNengLiDeFen,
        totalScore: cePingJiLuBiao.zongFen,
        recommendedGrade: cePingJiLuBiao.tuiJianDangWei,
        weakDimension: cePingJiLuBiao.baoRuoWeiDu,
        aiSummary: cePingJiLuBiao.zhiNengTiZongJie,
        submitTime: cePingJiLuBiao.tiJiaoShiJian,
        reviewer: cePingJiLuBiao.fuHeRen,
        reviewComment: cePingJiLuBiao.fuHeYiJian,
        createdAt: cePingJiLuBiao.createdAt,
      })
      .from(cePingJiLuBiao)
      .where(eq(cePingJiLuBiao.id, recordId));

    if (!recordRows.length) throw new NotFoundException('测评记录不存在');
    const r = recordRows[0];

    const record: AssessmentRecord = {
      id: r.id,
      name: r.name,
      position: r.position,
      status: r.status,
      theoryScore: r.theoryScore,
      languageScore: r.languageScore,
      scriptScore: r.scriptScore,
      aigcScore: r.aigcScore,
      analysisScore: r.analysisScore,
      totalScore: r.totalScore,
      recommendedGrade: r.recommendedGrade,
      weakDimension: r.weakDimension,
      aiSummary: r.aiSummary,
      submitTime: r.submitTime,
      reviewer: r.reviewer,
      reviewComment: r.reviewComment,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    };

    const detailRows = await this.db
      .select({
        id: daTiMingXiBiao.id,
        questionId: daTiMingXiBiao.tiMu,
        submittedAnswer: daTiMingXiBiao.xinRenDaAn,
        autoScore: daTiMingXiBiao.ziDongDeFen,
        maxScore: daTiMingXiBiao.manFenKuaiZhao,
        scoringReason: daTiMingXiBiao.pingFenLiYou,
        confidence: daTiMingXiBiao.zhiXinDu,
        needsReview: daTiMingXiBiao.shiFouXuYaoFuHe,
        dimensionName: daTiMingXiBiao.suoShuWeiDuKuaiZhao,
        questionNumber: tiKuBiao.tiMuBianHao,
        stem: tiKuBiao.tiGan,
        questionType: tiKuBiao.tiXing,
      })
      .from(daTiMingXiBiao)
      .innerJoin(tiKuBiao, eq(daTiMingXiBiao.tiMu, tiKuBiao.id))
      .where(eq(daTiMingXiBiao.cePingJiLu, recordId))
      .orderBy(tiKuBiao.tiMuBianHao);

    const answerDetails: AnswerDetailItem[] = detailRows.map((d) => ({
      id: d.id,
      questionId: d.questionId,
      questionNumber: d.questionNumber,
      stem: d.stem,
      questionType: d.questionType,
      submittedAnswer: d.submittedAnswer,
      autoScore: d.autoScore ?? 0,
      maxScore: d.maxScore ?? 0,
      scoringReason: d.scoringReason,
      confidence: d.confidence,
      needsReview: d.needsReview ?? false,
      dimensionName: d.dimensionName,
      scoringSource: (d.questionType === '单选' || d.questionType === '判断') ? 'objective' : 'keyword-fallback',
    }));

    const notifications = await this.notificationService.getByRecordId(recordId);

    return { record, answerDetails, notifications };
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return this.notificationService.list();
  }

  getAiScoringStatus(): AiScoringStatus {
    return this.aiScoringService.getStatus();
  }
}
