import React, { useEffect, useState } from 'react';
import { FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { V11AssessmentReport, V11EvaluationRecord } from '@shared/api.interface';

const DIM_LABELS: Record<string, string> = {
  film_theory: '影视基础理论',
  visual_language: '视听语言应用',
  script_narrative: '剧本叙事拆解',
  aigc_business: 'AIGC 业务认知',
  analysis: '综合分析与项目反馈能力',
};

function safeJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function splitList(s: string): string[] {
  return s.split(/[、,，]/).map((v) => v.trim()).filter(Boolean);
}

interface V11ReportCenterProps {
  reports: V11AssessmentReport[];
  evaluations: V11EvaluationRecord[];
  onRefresh: () => void;
  selectedRecordId?: string | null;
}

function latestReportId(reports: V11AssessmentReport[]): string | null {
  if (reports.length === 0) return null;
  return reports.reduce((latest, item) => {
    const latestTime = Date.parse(latest.updatedAt || latest.createdAt || '');
    const itemTime = Date.parse(item.updatedAt || item.createdAt || '');
    return itemTime > latestTime ? item : latest;
  }, reports[0]).id;
}

const V11ReportCenter: React.FC<V11ReportCenterProps> = ({ reports, evaluations, onRefresh, selectedRecordId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(() => latestReportId(reports));

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedId(null);
      return;
    }

    const selectedRecordReport = selectedRecordId
      ? reports.find((item) => item.recordId === selectedRecordId)
      : null;
    if (selectedRecordReport) {
      setSelectedId(selectedRecordReport.id);
      return;
    }

    setSelectedId((current) => (
      current && reports.some((item) => item.id === current)
        ? current
        : latestReportId(reports)
    ));
  }, [reports, selectedRecordId]);

  const report = reports.find((r) => r.id === selectedId) ?? null;
  const evalRecord = report
    ? evaluations.find((e) => e.id === report.recordId) ?? null
    : null;

  const directionScores = report
    ? safeJson<Record<string, number>>(report.directionScoresJson, {})
    : {};
  const cultivationPlan = report
    ? safeJson<Record<string, string>>(report.cultivationPlanJson, {})
    : {};

  const handleCopy = async () => {
    if (!report?.reportMarkdown) return;
    try {
      await navigator.clipboard.writeText(report.reportMarkdown);
      toast.success('报告已复制到剪贴板');
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  return (
    <div className="flex h-full gap-6">
      <div className="w-72 shrink-0 overflow-y-auto rounded-sm border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">评估报告列表</h3>
        </div>
        {reports.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <FileText className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-xs">暂无报告</p>
          </div>
        )}
        {reports.map((r) => {
          const ev = evaluations.find((e) => e.id === r.recordId);
          const isActive = r.id === selectedId;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
            >
              <p className="truncate text-sm font-medium text-foreground">
                {ev?.newcomerName ?? '未知'}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{ev?.assessmentDate?.slice(0, 10) ?? ''}</span>
                {ev?.totalScore != null && (
                  <span className="tabular-nums font-semibold text-primary">{ev.totalScore}分</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!report && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            请选择一份报告查看
          </div>
        )}
        {report && evalRecord && (
          <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">评估报告</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {evalRecord.newcomerName} · {evalRecord.assessmentDate?.slice(0, 10)}
                </p>
              </div>
              {evalRecord.totalScore != null && (
                <span className="rounded-sm bg-primary px-3 py-1.5 text-lg font-bold tabular-nums text-primary-foreground">
                  {evalRecord.totalScore}
                </span>
              )}
            </div>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">基本信息</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">姓名：</span>{evalRecord.newcomerName}</div>
                <div><span className="text-muted-foreground">候选人ID：</span>{evalRecord.candidateId ?? '-'}</div>
                <div><span className="text-muted-foreground">目标岗位：</span>{evalRecord.targetRole}</div>
                <div><span className="text-muted-foreground">评估人：</span>{evalRecord.evaluatorName ?? '-'}</div>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">评分汇总</h3>
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <p className="text-muted-foreground">基础认知</p>
                  <p className="mt-1 text-lg tabular-nums font-semibold">{evalRecord.basicScore ?? '-'}<span className="text-xs text-muted-foreground">/25</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">任务型测评</p>
                  <p className="mt-1 text-lg tabular-nums font-semibold">{evalRecord.taskScore ?? '-'}<span className="text-xs text-muted-foreground">/60</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">兴趣匹配</p>
                  <p className="mt-1 text-lg tabular-nums font-semibold">{evalRecord.interestScore ?? '-'}<span className="text-xs text-muted-foreground">/15</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">总分</p>
                  <p className="mt-1 text-2xl tabular-nums font-bold text-primary">{evalRecord.totalScore ?? '-'}<span className="text-xs text-muted-foreground">/100</span></p>
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">五维得分</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2 text-left font-medium">方向</th>
                    <th className="pb-2 text-right font-medium">得分</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(directionScores).map(([key, score]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="py-2">{DIM_LABELS[key] ?? key}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">方向判定</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">主方向：</span>{DIM_LABELS[evalRecord.mainDirection ?? ''] ?? evalRecord.mainDirection ?? '-'}</div>
                <div><span className="text-muted-foreground">辅方向：</span>{DIM_LABELS[evalRecord.secondaryDirection ?? ''] ?? evalRecord.secondaryDirection ?? '-'}</div>
                {evalRecord.potentialDirection && (
                  <div><span className="text-muted-foreground">潜力方向：</span>{DIM_LABELS[evalRecord.potentialDirection] ?? evalRecord.potentialDirection}</div>
                )}
                {evalRecord.notRecommendedDirection && (
                  <div><span className="text-muted-foreground">不建议优先：</span>{DIM_LABELS[evalRecord.notRecommendedDirection] ?? evalRecord.notRecommendedDirection}</div>
                )}
                {evalRecord.talentProfile && (
                  <div className="col-span-2"><span className="text-muted-foreground">人才画像：</span>{evalRecord.talentProfile}</div>
                )}
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">优势与短板</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">优势</p>
                  <div className="flex flex-wrap gap-2">
                    {splitList(report.strengths).map((s, i) => (
                      <span key={i} className="rounded-sm bg-accent px-2 py-1 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">短板</p>
                  <div className="flex flex-wrap gap-2">
                    {splitList(report.weaknesses).map((s, i) => (
                      <span key={i} className="rounded-sm bg-[hsl(0_65%_92%)] px-2 py-1 text-xs text-[hsl(0_65%_40%)]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">适合承担任务</h3>
              <div className="flex flex-wrap gap-2">
                {splitList(report.suitableTasks).map((t, i) => (
                  <span key={i} className="rounded-sm border border-border px-2 py-1 text-xs text-foreground">{t}</span>
                ))}
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">培养建议</h3>
              <div className="space-y-3 text-sm">
              {Object.entries(cultivationPlan).map(([key, value], index) => (
                <div key={key}><p className="text-xs text-muted-foreground">第{index + 1}天</p><p className="mt-1">{value}</p></div>
              ))}
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">完整报告</h3>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-foreground">
                {report.reportMarkdown}
              </pre>
            </section>

            <div className="flex gap-3">
              <button
                disabled
                title="即将上线"
                className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                导出 PDF
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                <Copy className="h-4 w-4" />
                复制报告
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default V11ReportCenter;
