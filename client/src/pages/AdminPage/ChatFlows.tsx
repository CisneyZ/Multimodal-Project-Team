import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import type { ChatFlowNode } from '@shared/api.interface';
import { getChatFlows } from '../../api/onboarding';
import { logger } from '@lark-apaas/client-toolkit/logger';

const STATUS_LABELS: Record<string, string> = {
  not_started: '未开始',
  background_pending: '待阅读背景材料',
  background_done: '等待管理安排',
  rules_pending: '待阅读规则文档',
  rules_done: '待规则测试',
  rule_test_done: '等待管理确认',
  waiting_admin: '等待管理确认',
};

const ChatFlows: React.FC = () => {
  const [flows, setFlows] = useState<ChatFlowNode[]>([]);

  useEffect(() => {
    getChatFlows()
      .then(setFlows)
      .catch((err) => logger.error('Failed to load chat flows', err));
  }, []);

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">聊天流程配置</h2>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3 w-3" />
          新增流程
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">阶段</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">触发状态</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">欢迎语</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">启用</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((flow) => (
              <tr key={flow.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 text-xs font-medium">{flow.stageLabel}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {STATUS_LABELS[flow.stage] ?? flow.stage}
                  </span>
                </td>
                <td className="max-w-sm px-4 py-2.5 text-xs text-muted-foreground">{flow.welcomeMessage}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-xs ${flow.isEnabled ? 'text-[hsl(152_55%_38%)]' : 'text-muted-foreground'}`}>
                    {flow.isEnabled ? '已启用' : '已禁用'}
                  </span>
                </td>
              </tr>
            ))}
            {flows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无聊天流程配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatFlows;
