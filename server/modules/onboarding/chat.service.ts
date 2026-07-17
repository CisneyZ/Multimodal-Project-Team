import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { onboardingProgress, tongZhiJiLuBiao } from '@server/database/schema';
import type {
  ChatFlowNode,
  ChatPhrase,
  ChatBootstrapResponse,
  ChatMessageResponse,
} from '@shared/api.interface';

const FLOW_NODES: ChatFlowNode[] = [
  { id: 'flow-1', stage: 'not_started', stageLabel: '未开始', welcomeMessage: '你好！请先在页面上填写姓名并点击"开始引导流程"，我会全程协助你完成项目引导。', isEnabled: true },
  { id: 'flow-2', stage: 'background_pending', stageLabel: '背景材料阅读', welcomeMessage: '当前阶段是项目背景材料阅读。请仔细阅读页面上展示的项目背景材料，了解项目的基本信息和业务逻辑后，点击"已阅读完毕"进入下一步。', isEnabled: true },
  { id: 'flow-3', stage: 'background_done', stageLabel: '等待管理安排', welcomeMessage: '你已完成项目背景阅读，我已提醒管理员为你安排下一步。请耐心等待，也可以点击"再次提醒管理"催促一下。', isEnabled: true },
  { id: 'flow-4', stage: 'rules_pending', stageLabel: '规则文档阅读', welcomeMessage: '管理员已为你发放规范文档，请仔细阅读页面上的团队规则文档，了解工作规范和流程要求后，点击"已阅读完毕"进入规则测试。', isEnabled: true },
  { id: 'flow-5', stage: 'rules_done', stageLabel: '规则测试', welcomeMessage: '规则文档阅读完成！现在请完成下方的规则测试题，检验你对团队规范的理解程度。', isEnabled: true },
  { id: 'flow-6', stage: 'rule_test_done', stageLabel: '等待管理确认', welcomeMessage: '规则测试已完成提交，等待管理员确认测试结果。确认通过后你的引导流程就完成了！', isEnabled: true },
];

const PHRASES: ChatPhrase[] = [
  { id: 'p-1', category: '通用引导', keywords: ['该做什么', '做什么', '下一步', '怎么办', '怎么操作'], quickButtonTitle: '我现在该做什么', replyContent: '请查看页面当前阶段的内容，按照提示完成对应操作。如果有疑问，可以随时问我！', isEnabled: true },
  { id: 'p-2', category: '通用引导', keywords: ['提醒管理', '催一下', '催促', '再次提醒'], quickButtonTitle: '再次提醒管理', replyContent: '好的，我已再次提醒管理员为你安排下一步，请耐心等待。', isEnabled: true },
  { id: 'p-3', category: '材料查看', keywords: ['项目材料', '背景材料', '项目背景', '查看项目'], quickButtonTitle: '查看项目材料', replyContent: '项目背景材料在页面上方展示，请滚动查看。如果当前不是背景阅读阶段，请先完成当前阶段的操作。', isEnabled: true },
  { id: 'p-4', category: '材料查看', keywords: ['规则文档', '规范文档', '查看规则', '团队规则'], quickButtonTitle: '查看规则文档', replyContent: '规则文档在管理员发放后会在页面中展示。如果尚未看到，说明管理员还在安排中，请耐心等待。', isEnabled: true },
  { id: 'p-5', category: '测试相关', keywords: ['规则测试', '测试怎么做', '怎么答题', '考试'], quickButtonTitle: '规则测试怎么做', replyContent: '规则测试包含单选和判断题，请根据之前阅读的规则文档作答。完成后点击"提交测试"即可。', isEnabled: true },
  { id: 'p-6', category: '测试相关', keywords: ['分数', '得分', '成绩', '通过率', '及格'], quickButtonTitle: null, replyContent: '规则测试满分的 60% 为通过线。如果未通过，管理员会安排补强学习。', isEnabled: true },
  { id: 'p-7', category: '帮助', keywords: ['帮助', 'help', '怎么用', '使用说明'], quickButtonTitle: null, replyContent: '我是你的引导助手，可以帮你了解当前阶段该做什么、查看材料、提醒管理员等。请直接输入问题或点击快捷按钮。', isEnabled: true },
  { id: 'p-8', category: '帮助', keywords: ['联系', '管理员', '人工', '找人'], quickButtonTitle: null, replyContent: '如需人工协助，请联系你的直属主管或 HR 培训负责人。我会在系统内持续为你记录进度。', isEnabled: true },
];

const FALLBACK_REPLY = '我已记录你的问题，当前先按页面主流程完成；如需人工协助请联系管理员。';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly remindCooldownMs = 5 * 60 * 1000;
  private readonly recentReminders = new Map<string, number>();

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getBootstrap(progressId?: string): Promise<ChatBootstrapResponse> {
    let stage = 'not_started';
    if (progressId) {
      const rows = await this.db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.id, progressId))
        .limit(1);
      if (rows.length > 0) {
        stage = rows[0].status;
      }
    }

    const flowNode = FLOW_NODES.find((n) => n.stage === stage && n.isEnabled);
    const welcomeMessage = flowNode?.welcomeMessage ?? '你好！我是引导助手，有什么可以帮你的吗？';

    const quickButtons = PHRASES
      .filter((p) => p.isEnabled && p.quickButtonTitle)
      .map((p) => ({ title: p.quickButtonTitle!, action: p.id }));

    return { welcomeMessage, quickButtons };
  }

  async replyToMessage(progressId: string | undefined, message: string): Promise<ChatMessageResponse> {
    const normalized = message.trim().toLowerCase();

    for (const phrase of PHRASES) {
      if (!phrase.isEnabled) continue;
      const matched = phrase.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
      if (matched) {
        return { reply: phrase.replyContent, matchedPhrase: true };
      }
    }

    return { reply: FALLBACK_REPLY, matchedPhrase: false };
  }

  async remindAdmin(progressId: string): Promise<{ success: boolean; message: string }> {
    const rows = await this.db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.id, progressId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('Progress record not found');
    }

    const progress = rows[0];
    const now = Date.now();
    const lastRemind = this.recentReminders.get(progressId);

    if (lastRemind && now - lastRemind < this.remindCooldownMs) {
      return { success: true, message: '已记录你的提醒，管理员正在处理中，请稍后。' };
    }

    this.recentReminders.set(progressId, now);

    await this.db.insert(tongZhiJiLuBiao).values({
      tongZhiLeiXing: 'manual_reminder',
      jieShouJiaoSe: 'admin',
      guanLianJiLu: progressId,
      biaoTi: `新人 ${progress.newcomerName} 再次提醒管理`,
      neiRong: `新人 ${progress.newcomerName}（目标岗位：${progress.targetRole}）通过聊天助手再次提醒管理员安排下一步操作。`,
      zhuangTai: '未发送',
    });

    this.logger.log(`Manual reminder created for progress: ${progressId}`);
    return { success: true, message: '已再次提醒管理员，请耐心等待。' };
  }

  getChatFlows(): ChatFlowNode[] {
    return FLOW_NODES;
  }

  getChatPhrases(): ChatPhrase[] {
    return PHRASES;
  }
}
