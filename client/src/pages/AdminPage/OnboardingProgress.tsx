import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { OnboardingProgressItem, OnboardingStatus } from '@shared/api.interface';

interface OnboardingProgressProps {
  progressList: OnboardingProgressItem[];
  onRefresh: () => void;
  onAdvanceRules: (progressId: string) => Promise<void>;
}

const STATUS_LABELS: Record<OnboardingStatus, string> = {
  background_pending: '待阅读背景材料',
  background_done: '已完成背景阅读',
  rules_pending: '待阅读规则文档',
  rules_done: '已完成规则阅读',
  rule_test_done: '已完成规则测试',
  waiting_admin: '等待管理确认',
};

const STATUS_COLORS: Record<OnboardingStatus, string> = {
  background_pending: 'bg-muted text-muted-foreground',
  background_done: 'bg-[hsl(213_52%_92%)] text-[hsl(213_52%_35%)]',
  rules_pending: 'bg-muted text-muted-foreground',
  rules_done: 'bg-[hsl(213_52%_92%)] text-[hsl(213_52%_35%)]',
  rule_test_done: 'bg-[hsl(152_55%_92%)] text-[hsl(152_55%_30%)]',
  waiting_admin: 'bg-[hsl(33_85%_92%)] text-[hsl(33_85%_35%)]',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '未完成';
  return new Date(dateStr).toLocaleString('zh-CN');
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ progressList, onRefresh, onAdvanceRules }) => (
  <div className="rounded-sm border border-border bg-card shadow-sm">
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">引导进度</h2>
        <p className="mt-1 text-xs text-muted-foreground">共 {progressList.length} 位新人</p>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
      >
        <RefreshCw className="h-3 w-3" />
        刷新
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">新人姓名</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">目标岗位</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">状态</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">背景阅读</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">规则阅读</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">测试分数</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">更新时间</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">操作</th>
          </tr>
        </thead>
        <tbody>
          {progressList.map((p) => (
            <tr key={p.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-2.5 text-xs font-medium">{p.newcomerName}</td>
              <td className="px-4 py-2.5 text-xs">{p.targetRole}</td>
              <td className="px-4 py-2.5">
                <span className={`rounded-sm px-1.5 py-0.5 text-xs ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(p.backgroundCompletedAt)}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(p.rulesCompletedAt)}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-xs">
                {p.ruleTestScore !== null ? p.ruleTestScore : '-'}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {p.ruleTestCompletedAt ? formatDate(p.ruleTestCompletedAt) : '-'}
              </td>
              <td className="px-4 py-2.5 text-center">
                {p.status === 'background_done' ? (
                  <button
                    onClick={() => onAdvanceRules(p.id)}
                    className="rounded-sm bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    安排规则文档阅读
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
          {progressList.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                暂无引导进度记录
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default OnboardingProgress;
