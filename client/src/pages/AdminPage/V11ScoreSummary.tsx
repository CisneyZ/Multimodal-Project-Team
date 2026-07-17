import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { V11AssessmentReport, V11EvaluationRecord } from '@shared/api.interface';

const DIMENSIONS = [
  { code: 'film_theory', name: '影视基础理论', color: '#1e3a5f' },
  { code: 'visual_language', name: '视听语言应用', color: '#2f6690' },
  { code: 'script_narrative', name: '剧本叙事拆解', color: '#3a8f6b' },
  { code: 'aigc_business', name: 'AIGC 业务认知', color: '#c77700' },
  { code: 'analysis', name: '综合分析与反馈', color: '#b83232' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending_review: '待复核',
  reviewed: '已复核',
  report_ready: '已出报告',
  submitted: '已提交',
  in_progress: '进行中',
};

const SCORE_BANDS = [
  { key: '85+', label: '85 分以上', min: 85, max: 100, color: '#3a8f6b' },
  { key: '70-84', label: '70-84 分', min: 70, max: 84, color: '#2f6690' },
  { key: '55-69', label: '55-69 分', min: 55, max: 69, color: '#c77700' },
  { key: '<55', label: '55 分以下', min: 0, max: 54, color: '#b83232' },
];

interface V11ScoreSummaryProps {
  evaluations: V11EvaluationRecord[];
  reports: V11AssessmentReport[];
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function pct(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getTopDirectionFromReport(report?: V11AssessmentReport): string | null {
  const scores = safeJson<Record<string, number>>(report?.directionScoresJson, {});
  const top = Object.entries(scores)
    .filter(([code]) => DIMENSIONS.some((dim) => dim.code === code))
    .sort((a, b) => Number(b[1] ?? 0) - Number(a[1] ?? 0))[0];
  return top?.[0] ?? null;
}

function getFallbackDirection(record: V11EvaluationRecord, report?: V11AssessmentReport): string | null {
  if (record.mainDirection) return record.mainDirection;
  const topReportDirection = getTopDirectionFromReport(report);
  if (topReportDirection) return topReportDirection;
  const selected = safeJson<string[]>(record.selectedTaskDirectionsJson, []);
  return selected[0] ?? null;
}

const SummaryNumber: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-sm border border-border bg-card p-10 text-center shadow-sm">
    <p className="text-sm font-medium text-foreground">暂无可统计的测评记录</p>
    <p className="mt-2 text-xs text-muted-foreground">完成测评并生成初审或复核分数后，这里会展示维度占比和分数分布。</p>
  </div>
);

const V11ScoreSummary: React.FC<V11ScoreSummaryProps> = ({ evaluations, reports }) => {
  const reportByRecordId = useMemo(() => {
    const map = new Map<string, V11AssessmentReport>();
    reports.forEach((report) => map.set(report.recordId, report));
    return map;
  }, [reports]);

  const scoredEvaluations = useMemo(
    () => evaluations.filter((record) => record.totalScore != null || record.basicScore != null || record.taskScore != null || record.interestScore != null),
    [evaluations],
  );

  const stats = useMemo(() => {
    const total = scoredEvaluations.length;
    const dimensionCounts = DIMENSIONS.map((dim) => ({ ...dim, count: 0, percentage: 0 }));
    const selectedCounts = DIMENSIONS.map((dim) => ({ ...dim, count: 0, percentage: 0 }));
    const averageScores = DIMENSIONS.map((dim) => ({ ...dim, totalScore: 0, count: 0, average: 0 }));
    const statusCounts = Object.keys(STATUS_LABELS).map((key) => ({ key, label: STATUS_LABELS[key], count: 0 }));
    const scoreBands = SCORE_BANDS.map((band) => ({ ...band, count: 0, percentage: 0 }));

    let totalScoreSum = 0;
    let totalScoreCount = 0;
    let selectedTotal = 0;

    for (const record of scoredEvaluations) {
      const report = reportByRecordId.get(record.id);
      const direction = getFallbackDirection(record, report);
      const dimItem = dimensionCounts.find((item) => item.code === direction);
      if (dimItem) dimItem.count += 1;

      const selectedDirections = safeJson<string[]>(record.selectedTaskDirectionsJson, []);
      for (const code of selectedDirections) {
        const selected = selectedCounts.find((item) => item.code === code);
        if (selected) {
          selected.count += 1;
          selectedTotal += 1;
        }
      }

      const status = statusCounts.find((item) => item.key === record.status);
      if (status) status.count += 1;

      if (record.totalScore != null) {
        totalScoreSum += record.totalScore;
        totalScoreCount += 1;
        const band = scoreBands.find((item) => record.totalScore! >= item.min && record.totalScore! <= item.max);
        if (band) band.count += 1;
      }

      const directionScores = safeJson<Record<string, number>>(report?.directionScoresJson, {});
      for (const dim of averageScores) {
        const score = directionScores[dim.code];
        if (score != null && Number.isFinite(Number(score))) {
          dim.totalScore += Number(score);
          dim.count += 1;
        }
      }
    }

    dimensionCounts.forEach((item) => { item.percentage = total === 0 ? 0 : Math.round((item.count / total) * 100); });
    selectedCounts.forEach((item) => { item.percentage = selectedTotal === 0 ? 0 : Math.round((item.count / selectedTotal) * 100); });
    scoreBands.forEach((item) => { item.percentage = totalScoreCount === 0 ? 0 : Math.round((item.count / totalScoreCount) * 100); });
    averageScores.forEach((item) => { item.average = item.count === 0 ? 0 : Number((item.totalScore / item.count).toFixed(1)); });

    return {
      total,
      reviewed: scoredEvaluations.filter((record) => record.status === 'reviewed' || record.status === 'report_ready').length,
      reportReady: scoredEvaluations.filter((record) => record.status === 'report_ready').length,
      averageTotalScore: totalScoreCount === 0 ? 0 : Number((totalScoreSum / totalScoreCount).toFixed(1)),
      dimensionCounts,
      selectedCounts,
      averageScores,
      statusCounts: statusCounts.filter((item) => item.count > 0),
      scoreBands,
    };
  }, [reportByRecordId, scoredEvaluations]);

  if (stats.total === 0) return <EmptyState />;

  const topDimension = [...stats.dimensionCounts].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryNumber label="纳入统计人数" value={stats.total} sub={`已复核/出报告 ${stats.reviewed} 人`} />
        <SummaryNumber label="平均总分" value={stats.averageTotalScore} sub="按已有总分记录计算" />
        <SummaryNumber label="已出报告" value={stats.reportReady} sub={pct(stats.reportReady, stats.total)} />
        <SummaryNumber label="人数最多维度" value={topDimension?.name ?? '-'} sub={`${topDimension?.count ?? 0} 人，占 ${pct(topDimension?.count ?? 0, stats.total)}`} />
      </div>

      <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">主方向人数占比</h2>
            <p className="mt-1 text-xs text-muted-foreground">优先按报告主方向统计；没有报告时用维度分最高项或已选任务方向兜底。</p>
          </div>
          <span className="rounded-sm bg-accent px-2 py-1 text-xs text-muted-foreground">共 {stats.total} 人</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.dimensionCounts}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={94}
                  paddingAngle={2}
                >
                  {stats.dimensionCounts.map((entry) => (
                    <Cell key={entry.code} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value} 人`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {stats.dimensionCounts.map((item) => (
              <div key={item.code}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">{item.count} 人 · {item.percentage}%</span>
                </div>
                <div className="h-2 rounded-sm bg-accent">
                  <div className="h-full rounded-sm" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">各维度平均得分</h2>
            <p className="mt-1 text-xs text-muted-foreground">基于已生成报告中的五维得分统计。</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.averageScores} margin={{ left: 0, right: 8, top: 8, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={58} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${value} 分`, '平均得分']} />
                <Bar dataKey="average" radius={[2, 2, 0, 0]}>
                  {stats.averageScores.map((entry) => (
                    <Cell key={entry.code} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">总分区间人数</h2>
            <p className="mt-1 text-xs text-muted-foreground">用于判断当前新人整体能力层级分布。</p>
          </div>
          <div className="space-y-4">
            {stats.scoreBands.map((band) => (
              <div key={band.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{band.label}</span>
                  <span className="tabular-nums text-muted-foreground">{band.count} 人 · {band.percentage}%</span>
                </div>
                <div className="h-3 rounded-sm bg-accent">
                  <div className="h-full rounded-sm" style={{ width: `${band.percentage}%`, backgroundColor: band.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">任务方向选择覆盖</h2>
            <p className="mt-1 text-xs text-muted-foreground">统计新人任务题选择方向，可观察训练兴趣和样本覆盖。</p>
          </div>
          <div className="space-y-3">
            {stats.selectedCounts.map((item) => (
              <div key={item.code} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{item.name}</span>
                <div className="h-2 flex-1 rounded-sm bg-accent">
                  <div className="h-full rounded-sm" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                </div>
                <span className="w-20 text-right text-xs tabular-nums text-foreground">{item.count} 次</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">复核状态</h2>
            <p className="mt-1 text-xs text-muted-foreground">用于判断评分流程是否完成闭环。</p>
          </div>
          <div className="space-y-3">
            {stats.statusCounts.map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums text-primary">{item.count} 人</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default V11ScoreSummary;
