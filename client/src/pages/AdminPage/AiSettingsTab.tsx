import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Database,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { getFeishuAgentStatus, runFeishuAgentAction } from '../../api/v11';
import type {
  FeishuAgentActionResult,
  FeishuAgentAvailableAction,
  FeishuAgentStatus,
} from '@shared/api.interface';

const statusBadge = (ok: boolean, okText: string, failText: string) => (
  <span
    className={
      'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs ' +
      (ok
        ? 'bg-[hsl(152_55%_92%)] text-[hsl(152_55%_30%)]'
        : 'bg-[hsl(33_85%_92%)] text-[hsl(33_85%_35%)]')
    }
  >
    {ok ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
    {ok ? okText : failText}
  </span>
);

const Metric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-sm border border-border bg-background px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
  </div>
);

const AiSettingsTab: React.FC = () => {
  const [status, setStatus] = useState<FeishuAgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [result, setResult] = useState<FeishuAgentActionResult | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const next = await getFeishuAgentStatus();
      setStatus(next);
    } catch (err) {
      logger.error('加载飞书智能体状态失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleRunAction = async (action: FeishuAgentAvailableAction) => {
    if (action.writesData) {
      const confirmed = window.confirm(`确认执行“${action.label}”？该动作会写入飞书多维表格。`);
      if (!confirmed) return;
    }
    setRunningAction(action.type);
    setResult(null);
    try {
      const next = await runFeishuAgentAction({ action: action.type });
      setResult(next);
      if (action.type === 'refresh_metrics' || action.type === 'test_connection' || action.writesData) {
        await loadStatus();
      }
    } catch (err) {
      logger.error('执行飞书智能体动作失败', err);
      setResult({
        success: false,
        action: action.type,
        message: '请求失败，请检查服务状态或稍后重试',
        summary: {},
        operatedAt: new Date().toISOString(),
      });
    } finally {
      setRunningAction(null);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">加载智能体状态...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        智能体状态暂不可用，请稍后刷新。
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">飞书操作智能体</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              DeepSeek 负责生成判断，飞书写入由后端白名单动作执行。
            </p>
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">DeepSeek</span>
              <span className="ml-auto">
                {statusBadge(status.deepSeekConfigured, '已配置', '未配置')}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              模型：<span className="font-mono text-foreground">{status.deepSeekModel}</span>
            </p>
          </div>

          <div className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">飞书多维表格</span>
              <span className="ml-auto">
                {statusBadge(status.connected, '已连接', status.configured ? '待检测' : '未配置')}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              可访问表：{status.accessibleTableCount}/{status.tableCount}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-sm border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {status.message}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="待人工评分" value={status.pendingReviewCount} />
        <Metric label="已生成报告" value={status.reportCount} />
        <Metric label="培训材料" value={status.trainingResourceCount} />
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">可执行动作</h2>
        </div>
        <div className="divide-y divide-border">
          {status.actions.map((action) => (
            <div key={action.type} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  {action.writesData && (
                    <span className="rounded-sm bg-[hsl(33_85%_92%)] px-1.5 py-0.5 text-[10px] text-[hsl(33_85%_35%)]">
                      写入飞书
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleRunAction(action)}
                disabled={!action.enabled || runningAction === action.type}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {runningAction === action.type && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                执行
              </button>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div
          className={
            'rounded-sm border px-4 py-3 text-sm shadow-sm ' +
            (result.success
              ? 'border-[hsl(152_55%_50%)] bg-[hsl(152_55%_96%)] text-[hsl(152_55%_28%)]'
              : 'border-[hsl(0_65%_55%)] bg-[hsl(0_65%_96%)] text-[hsl(0_65%_36%)]')
          }
        >
          <p className="font-medium">{result.message}</p>
          {Object.keys(result.summary).length > 0 && (
            <pre className="mt-3 max-h-64 overflow-auto rounded-sm bg-white/60 p-3 text-xs text-foreground">
              {JSON.stringify(result.summary, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">DeepSeek 环境变量</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-sm bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
{`DEEPSEEK_API_KEY=你的 key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          API Key 只放在服务端 .env，不在后台页面回显。
        </p>
      </div>
    </div>
  );
};

export default AiSettingsTab;
