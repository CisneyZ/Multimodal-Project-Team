import { Injectable, Logger } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import type { ScoringSource } from '@shared/api.interface';

export interface AiScoreResult {
  score: number;
  reason: string;
  confidence: number;
  needsReview: boolean;
  scoringSource: ScoringSource;
}

@Injectable()
export class AiScoringService {
  private readonly logger = new Logger(AiScoringService.name);

  constructor(private readonly scoringService: ScoringService) {}

  async scoreSubjective(
    keywords: string | null,
    stem: string,
    submittedAnswer: string,
    maxScore: number,
    threshold: number,
  ): Promise<AiScoreResult> {
    // TODO: 接入飞书妙搭智能体时，替换此处逻辑为 callFeishuAgent()
    // 当前使用关键词评分作为 fallback
    const result = this.scoringService.scoreSubjective(keywords, submittedAnswer, maxScore, threshold);
    return {
      ...result,
      scoringSource: 'keyword-fallback',
    };
  }

  getStatus() {
    return {
      connected: false,
      currentMode: 'keyword-fallback' as ScoringSource,
      fallbackDescription: '当前使用关键词匹配进行主观题粗评分，命中比例低于阈值时标记为需人工复核',
      reviewThreshold: 0.65,
      integrationGuide: [
        '接入步骤：',
        '1. 在飞书妙搭平台创建智能体，配置主观题评分 prompt',
        '2. 获取智能体 pluginInstanceId',
        '3. 在 server/capabilities/ 下创建配置文件',
        '4. 将 scoreSubjective 中的关键词评分替换为 capabilityClient.load(id).call() 调用',
        '5. scoringSource 将自动切换为 ai-agent',
      ].join('\n'),
    };
  }

  // TODO: 填入飞书妙搭智能体调用逻辑
  // async callFeishuAgent(stem: string, answer: string, maxScore: number): Promise<AiScoreResult> {
  //   const pluginInstanceId = 'your_ai_scoring_plugin_id';
  //   const plugin = capabilityService.load(pluginInstanceId);
  //   const result = await plugin.call('score', { stem, answer, maxScore });
  //   return { ...result, scoringSource: 'ai-agent' };
  // }
}
