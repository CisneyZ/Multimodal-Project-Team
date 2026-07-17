import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { V11AssessmentConfig } from '@shared/api.interface';
import { getAssessmentConfig, updateAssessmentConfig } from '../../api/v11';

const TASK_MODE_LABELS: Record<string, string> = {
  five_select_three: '五选三（默认）',
  all_five: '全部五道',
};

const AssessmentConfigV11: React.FC = () => {
  const [config, setConfig] = useState<V11AssessmentConfig | null>(null);
  const [taskMode, setTaskMode] = useState<string>('five_select_three');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAssessmentConfig()
      .then((c) => { setConfig(c); setTaskMode(c.taskMode); })
      .catch((err: unknown) => logger.error('Failed to load assessment config', err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAssessmentConfig({ taskMode: taskMode as V11AssessmentConfig['taskMode'] });
      setConfig(updated);
    } catch (err) {
      logger.error('Failed to save config', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Settings className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">测评配置 V1.1</h2>
      </div>
      <div className="space-y-6 p-6">
        <div>
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">版本信息</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-sm bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground">版本</p>
              <p className="text-sm font-semibold text-foreground">{config?.version ?? '-'}</p>
            </div>
            <div className="rounded-sm bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground">基础认知</p>
              <p className="text-sm font-semibold text-foreground">{config?.basicScoreTotal ?? 25} 分</p>
            </div>
            <div className="rounded-sm bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground">任务测评</p>
              <p className="text-sm font-semibold text-foreground">{config?.taskScoreTotal ?? 60} 分</p>
            </div>
            <div className="rounded-sm bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground">兴趣匹配</p>
              <p className="text-sm font-semibold text-foreground">{config?.interestScoreTotal ?? 15} 分</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">任务模式</h3>
          <div className="flex gap-4">
            {Object.entries(TASK_MODE_LABELS).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="taskMode"
                  value={key}
                  checked={taskMode === key}
                  onChange={() => setTaskMode(key)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {taskMode === 'five_select_three'
              ? '新人从 5 道任务中选择 3 道作答，每道 20 分，合计 60 分'
              : '新人需完成全部 5 道任务，取平均分 × 3 作为任务型测评分'}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">总分结构</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-sm bg-[hsl(213_52%_92%)] px-2 py-1 text-xs text-[hsl(213_52%_35%)]">基础 25</span>
            <span className="text-muted-foreground">+</span>
            <span className="rounded-sm bg-[hsl(152_55%_92%)] px-2 py-1 text-xs text-[hsl(152_55%_30%)]">任务 60</span>
            <span className="text-muted-foreground">+</span>
            <span className="rounded-sm bg-[hsl(33_85%_92%)] px-2 py-1 text-xs text-[hsl(33_85%_35%)]">兴趣 15</span>
            <span className="text-muted-foreground">=</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">总分 100</span>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !config} className="rounded-sm bg-primary px-4 py-2 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentConfigV11;
