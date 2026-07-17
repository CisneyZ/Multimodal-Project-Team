import { Injectable, Logger } from '@nestjs/common';

import type { ScoringSource } from '@shared/api.interface';

export interface ScoreResult {
  score: number;
  reason: string;
  confidence: number;
  needsReview: boolean;
  scoringSource: ScoringSource;
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  scoreObjective(
    correctAnswer: string,
    submittedAnswer: string,
    maxScore: number,
  ): ScoreResult {
    const isCorrect =
      submittedAnswer.trim().toUpperCase() ===
      correctAnswer?.trim().toUpperCase();
    return {
      score: isCorrect ? maxScore : 0,
      reason: isCorrect
        ? '答案正确'
        : `答案错误，正确答案为 ${correctAnswer}`,
      confidence: 1.0,
      needsReview: false,
      scoringSource: 'objective',
    };
  }

  scoreSubjective(
    keywords: string | null,
    submittedAnswer: string,
    maxScore: number,
    threshold: number,
  ): ScoreResult {
    const keywordList =
      keywords
        ?.split(',')
        .map((k: string) => k.trim())
        .filter(Boolean) || [];

    if (keywordList.length === 0) {
      return {
        score: 0,
        reason: '未配置评分关键词，需人工评分',
        confidence: 0,
        needsReview: true,
        scoringSource: 'keyword-fallback',
      };
    }

    const matched = keywordList.filter((k: string) =>
      submittedAnswer.includes(k),
    );
    const ratio = matched.length / keywordList.length;
    const score = Math.round(ratio * maxScore);

    return {
      score,
      reason: `命中关键词 ${matched.length}/${keywordList.length}: ${matched.join('、') || '无'}`,
      confidence: Math.round(ratio * 100) / 100,
      needsReview: ratio < threshold,
      scoringSource: 'keyword-fallback',
    };
  }

  async scoreWithAI(
    _stem: string,
    _submittedAnswer: string,
    _maxScore: number,
  ): Promise<ScoreResult> {
    this.logger.log(
      'AI scoring not yet implemented, placeholder for future integration',
    );
    return {
      score: 0,
      reason: 'AI 评分服务尚未接入，请使用关键词评分或人工复核',
      confidence: 0,
      needsReview: true,
      scoringSource: 'keyword-fallback',
    };
  }
}
