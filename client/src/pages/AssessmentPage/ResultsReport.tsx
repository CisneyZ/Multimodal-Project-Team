import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Info } from 'lucide-react';
import type { SubmitAssessmentResponse } from '@shared/api.interface';

interface ResultsReportProps {
  result: SubmitAssessmentResponse;
  onReset: () => void;
  userName: string;
  userPosition: string;
}

const RADAR_COLORS = ['#1e3a5f', '#2d8a6e', '#c07020', '#c04040', '#4070b0'];

const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  '骨干培养': { text: 'text-[hsl(152_55%_30%)]', bg: 'bg-[hsl(152_55%_92%)]' },
  '岗位进阶': { text: 'text-[hsl(213_52%_35%)]', bg: 'bg-[hsl(213_52%_92%)]' },
  '基础执行': { text: 'text-[hsl(33_85%_35%)]', bg: 'bg-[hsl(33_85%_92%)]' },
  '入门补强': { text: 'text-[hsl(0_65%_40%)]', bg: 'bg-[hsl(0_65%_92%)]' },
};

const GRADE_CONCLUSIONS: Record<string, string> = {
  '骨干培养': '具备 AI 内容生产核心岗位能力，建议进入高级内容策划训练营，参与多模态项目实战。',
  '岗位进阶': '能力基础扎实，建议深化多模态叙事理解和 Prompt 工程实践，提升 AIGC 内容质量判断能力。',
  '基础执行': '适合进入 AI 内容生产基础训练营，重点加强视听语言表达和 AIGC 工具应用场景。',
  '入门补强': '需加强多模态内容理解和 AIGC 工具边界认知，建议系统学习影视基础与 AI 协作工作流课程。',
};

const ResultsReport: React.FC<ResultsReportProps> = ({ result, onReset, userName, userPosition }) => {
  const { totalScore, maxTotalScore, grade, dimensions, weakDimensions, aiSummary } = result;
  const [displayScore, setDisplayScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * totalScore));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [totalScore]);

  const gradeColor = GRADE_COLORS[grade] ?? GRADE_COLORS['入门补强'];
  const sortedDims = [...dimensions].sort((a, b) => a.percentage - b.percentage);
  const weakDimCodes = new Set(weakDimensions);

  const radarOption: EChartsOption = {
    tooltip: {},
    radar: {
      indicator: dimensions.map((d, i) => ({
        name: d.dimensionName,
        color: RADAR_COLORS[i % RADAR_COLORS.length],
      })),
      shape: 'polygon',
      splitNumber: 4,
      splitArea: { areaStyle: { color: ['#f8fafc', '#f1f5f9', '#e8edf2', '#dde4ec'] } },
      splitLine: { lineStyle: { color: '#cbd5e1' } },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisName: { fontSize: 11 },
    },
    series: [{
      type: 'radar',
      data: [{
        value: dimensions.map((d) => d.score),
        name: '能力得分',
        areaStyle: { color: 'rgba(30, 58, 95, 0.12)' },
        lineStyle: { color: '#1e3a5f', width: 2 },
        itemStyle: { color: '#1e3a5f' },
        symbol: 'circle',
        symbolSize: 5,
      }],
      animationDuration: 800,
    }],
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">能力画像报告</h1>
      </div>
      <p className="mb-6 text-center text-xs text-muted-foreground">
        AI 内容编导能力评估
      </p>

      <div className="mb-6 rounded-sm border border-border bg-card p-8 text-center shadow-sm">
        <p className="mb-1 text-sm text-muted-foreground">综合得分</p>
        <div className="mb-3 flex items-baseline justify-center gap-1">
          <span className="text-6xl font-bold tabular-nums text-primary">{displayScore}</span>
          <span className="text-lg text-muted-foreground">/ {maxTotalScore}</span>
        </div>
        <span className={`inline-block rounded-sm px-4 py-1.5 text-sm font-semibold ${gradeColor.bg} ${gradeColor.text}`}>
          {grade}
        </span>
        <div className="mt-4 flex items-start justify-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>评分来源：系统预评（客观题精确判分 + 主观题关键词匹配），低置信度主观题将进入人工复核</span>
        </div>
      </div>

      {GRADE_CONCLUSIONS[grade] && (
        <div className="mb-6 rounded-sm border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">评估结论</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{GRADE_CONCLUSIONS[grade]}</p>
        </div>
      )}

      <div className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">五维能力分布</h3>
        <div className="min-h-[280px]">
          <ReactECharts option={radarOption} theme="ud" className="h-[320px] w-full" />
        </div>
      </div>

      <div className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">各维度得分</h3>
        <div className="space-y-4">
          {dimensions.map((d) => {
            const pct = d.maxScore > 0 ? (d.score / d.maxScore) * 100 : 0;
            const isWeak = weakDimCodes.has(d.dimensionCode);
            return (
              <div key={d.dimensionCode}>
                <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-sm">
                  <span className={isWeak ? 'font-medium text-destructive' : 'text-foreground'}>
                    {d.dimensionName}
                    {isWeak && <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{d.score} / {d.maxScore}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all duration-700 ${isWeak ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sortedDims.filter((d) => weakDimCodes.has(d.dimensionCode) && d.suggestion).length > 0 && (
        <div className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">薄弱维度与培训建议</h3>
          <div className="space-y-4">
            {sortedDims.filter((d) => weakDimCodes.has(d.dimensionCode) && d.suggestion).map((d) => (
              <div key={d.dimensionCode} className="rounded-sm border-l-2 border-destructive bg-destructive/3 p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  {d.dimensionName}
                  <span className="ml-2 text-xs text-muted-foreground">({d.score}/{d.maxScore} 分)</span>
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    {d.suggestion}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSummary && (
        <div className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">评估总结</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{aiSummary}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onReset} className="rounded-sm">
          重新测评
        </Button>
        <Button onClick={() => navigate(`/onboarding?role=newcomer&name=${encodeURIComponent(userName)}&targetRole=${encodeURIComponent(userPosition)}&assessmentRecordId=${encodeURIComponent(result.assessmentId)}`)} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90">
          进入项目引导助手
        </Button>
      </div>
    </div>
  );
};

export default ResultsReport;
