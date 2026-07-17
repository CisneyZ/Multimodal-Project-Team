import React from 'react';
import type { OnboardingProgressItem } from '@shared/api.interface';

interface OnboardingTodosProps {
  pendingList: OnboardingProgressItem[];
  onAdvanceRules: (progressId: string) => Promise<void>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
}

const OnboardingTodos: React.FC<OnboardingTodosProps> = ({ pendingList, onAdvanceRules }) => (
  <div className="rounded-sm border border-border bg-card shadow-sm">
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">待办提醒</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {pendingList.length > 0
            ? `${pendingList.length} 条待处理，等待管理员发放规范文档`
            : '暂无待办事项'}
        </p>
      </div>
      {pendingList.length > 0 && (
        <span className="rounded-full bg-[hsl(0_65%_48%)] px-2 py-0.5 text-[10px] font-medium text-white">
          {pendingList.length} 待处理
        </span>
      )}
    </div>
    <div className="divide-y divide-border/50">
      {pendingList.map((p) => (
        <div key={p.id} className="flex items-center justify-between px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{p.newcomerName}</span>
              {p.targetRole && (
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {p.targetRole}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              已完成背景阅读：{formatDate(p.backgroundCompletedAt)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              当前阶段：等待管理员安排规范文档阅读
            </p>
          </div>
          <button
            onClick={() => onAdvanceRules(p.id)}
            className="ml-4 shrink-0 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
          >
            了解并发放规范文档
          </button>
        </div>
      ))}
      {pendingList.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          暂无待办事项，所有新人引导进度均正常推进。
        </div>
      )}
    </div>
  </div>
);

export default OnboardingTodos;
