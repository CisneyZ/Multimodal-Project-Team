import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getV11EvaluationDetail, saveV11Review, generateV11Report } from '../../api/v11';
import type {
  V11EvaluationRecord,
  V11EvaluationDetail,
  V11BasicQuestion,
  V11TaskQuestion,
  V11InterestQuestion,
  V11ReviewDto,
} from '@shared/api.interface';

interface V11ManualScoringProps {
  evaluations: V11EvaluationRecord[];
  onRefresh: () => void | Promise<void>;
  onReportReady?: (recordId: string) => void;
}

const DIM_LABELS: Record<string, string> = {
  film_theory: '影视基础理论',
  visual_language: '视听语言应用',
  script_narrative: '剧本叙事拆解',
  aigc_business: 'AIGC 业务认知',
  analysis: '综合分析与项目反馈能力',
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: '待评分',
  reviewed: '已评分',
  report_ready: '已出报告',
  submitted: '已提交',
  in_progress: '进行中',
};

const STATUS_FILTERS = [
  { key: '', label: '全部' },
  { key: 'pending_review', label: '待评分' },
  { key: 'reviewed', label: '已评分' },
  { key: 'report_ready', label: '已出报告' },
];

const INPUT = 'muchen-input w-full rounded-lg px-3 py-2 text-sm';
const BTN_PRIMARY = 'muchen-primary-btn rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50';
const BTN_SECONDARY = 'muchen-secondary-btn rounded-lg px-4 py-2 text-sm';
const MISSING_QUESTION_TEXT = '题目明细缺失（当前数据源未返回对应题库记录）';

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function clampScore(value: string, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(parsed, max));
}

function clampNumber(value: number | null | undefined, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, max));
}

function statusBadgeCls(s: string): string {
  if (s === 'pending_review') return 'border-amber-300/25 bg-amber-400/12 text-amber-200';
  if (s === 'reviewed') return 'border-sky-300/25 bg-sky-400/12 text-sky-200';
  if (s === 'report_ready') return 'border-emerald-300/25 bg-emerald-400/12 text-emerald-200';
  return 'border-white/10 bg-white/[0.055] text-white/56';
}

interface BasicSS { manualScore: number; comment: string }
interface TaskSS { s1: number; s2: number; s3: number; s4: number; s5: number; comment: string }
interface InterestSS { manualScore: number; comment: string }

const SectionHeader: React.FC<{
  open: boolean; onToggle: () => void; title: string; subtitle: string;
}> = ({ open, onToggle, title, subtitle }) => (
  <button onClick={onToggle} className="flex w-full items-center justify-between border-b border-white/10 pb-3">
    <span className="flex items-center gap-2 text-sm font-semibold text-white">
      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      {title}
    </span>
    <span className="text-xs text-white/46">{subtitle}</span>
  </button>
);

const BasicSection: React.FC<{
  detail: V11EvaluationDetail; open: boolean; onToggle: () => void;
  scores: Record<string, BasicSS>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, BasicSS>>>;
}> = ({ detail, open, onToggle, scores, setScores }) => {
  const update = (id: string, patch: Partial<BasicSS>) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };
  return (
    <div className="muchen-border-flow rounded-2xl p-4">
      <SectionHeader open={open} onToggle={onToggle} title="基础认知测试" subtitle="满分 25 分" />
      {open && (
        <div className="mt-3 space-y-4">
          {safeArray(detail.basicAnswers).map(a => {
            const q: V11BasicQuestion | undefined = a.question;
            const questionType = q?.questionType ?? (a.isCorrect === null ? 'short_answer' : 'single_choice');
            const maxScore = q?.score ?? Math.max(a.finalScore ?? a.manualScore ?? a.autoScore ?? 0, 0);
            const dimensionCode = q?.dimensionCode ?? a.dimensionCode;
            const isSubjective = questionType === 'short_answer';
            return (
              <div key={a.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-6 text-white">{q?.questionText ?? MISSING_QUESTION_TEXT}</p>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-xs text-white/56">
                    {questionType === 'single_choice' ? '单选' : questionType === 'true_false' ? '判断' : '简答'}
                  </span>
                </div>
                <div className="mt-1.5 rounded-lg border border-white/10 bg-black/24 px-2 py-1.5 text-sm text-white/76">{a.answer || '未作答'}</div>
                {!isSubjective && q && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {a.isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />正确 ({a.autoScore}分)</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3.5 w-3.5" />错误 ({a.autoScore ?? 0}分)</span>
                    )}
                    <span className="text-white/46">正确答案：{q.correctAnswer}</span>
                  </div>
                )}
                {!q && (
                  <p className="mt-2 text-xs leading-5 text-amber-200/80">
                    这条历史记录缺少题库关联，只展示已保存答案和分数，不影响筛选列表继续使用。
                  </p>
                )}
                {isSubjective && (
                  <div className="mt-2 space-y-2">
                    {q?.referenceAnswer && (
                      <p className="text-xs text-white/50">参考答案：{q.referenceAnswer}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="shrink-0 text-xs text-white/50">评分</label>
                      <input type="number" min={0} max={maxScore} step={1} value={scores[a.id]?.manualScore ?? 0}
                        onChange={e => update(a.id, { manualScore: clampScore(e.target.value, maxScore) })}
                        className={`${INPUT} w-20`} />
                      <span className="text-xs text-white/46">/ {maxScore}</span>
                    </div>
                    <textarea rows={2} placeholder="评语（选填）" value={scores[a.id]?.comment ?? ''}
                      onChange={e => update(a.id, { comment: e.target.value })} className={INPUT} />
                  </div>
                )}
                <div className="mt-1 text-xs text-white/44">{DIM_LABELS[dimensionCode] ?? dimensionCode}</div>
              </div>
            );
          })}
          {safeArray(detail.basicAnswers).length === 0 && (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-xs text-white/48">暂无基础题答题明细</p>
          )}
        </div>
      )}
    </div>
  );
};

const TaskSection: React.FC<{
  detail: V11EvaluationDetail; open: boolean; onToggle: () => void;
  scores: Record<string, TaskSS>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, TaskSS>>>;
}> = ({ detail, open, onToggle, scores, setScores }) => {
  const update = (id: string, patch: Partial<TaskSS>) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };
  const dims: { key: keyof Omit<TaskSS, 'comment'>; label: string; max: number }[] = [
    { key: 's1', label: '基础理解', max: 4 },
    { key: 's2', label: '分析质量', max: 6 },
    { key: 's3', label: '结构表达', max: 4 },
    { key: 's4', label: '落地应用', max: 4 },
    { key: 's5', label: '延展思考', max: 2 },
  ];
  return (
    <div className="muchen-border-flow rounded-2xl p-4">
      <SectionHeader open={open} onToggle={onToggle} title="任务型测评" subtitle="满分 60 分" />
      {open && (
        <div className="mt-3 space-y-4">
          {safeArray(detail.taskAnswers).map(a => {
            const t: V11TaskQuestion | undefined = a.task;
            const sc = scores[a.id];
            const subtotal = sc ? sc.s1 + sc.s2 + sc.s3 + sc.s4 + sc.s5 : 0;
            const dimensionCode = t?.dimensionCode ?? a.dimensionCode;
            return (
              <div key={a.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-white">{t?.title ?? MISSING_QUESTION_TEXT}</p>
                  <span className="text-xs text-white/46">{DIM_LABELS[dimensionCode] ?? dimensionCode}</span>
                </div>
                {t?.scenario && <p className="mt-1 text-xs leading-5 text-white/50">{t.scenario}</p>}
                {!t && (
                  <p className="mt-2 text-xs leading-5 text-amber-200/80">
                    这条历史记录缺少任务题库关联，只展示已保存答案和分数。
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-[#65c7ff]">主任务回答：</p>
                  <div className="rounded-lg border border-white/10 bg-black/24 px-2 py-1.5 text-sm text-white/76">{a.mainAnswer || '未作答'}</div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-[#65c7ff]">延展思考：</p>
                  <div className="rounded-lg border border-white/10 bg-black/24 px-2 py-1.5 text-sm text-white/76">{a.extensionAnswer || '未作答'}</div>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {dims.map(d => (
                    <div key={d.key}>
                      <label className="text-xs text-white/50">{d.label}(0-{d.max})</label>
                      <input type="number" min={0} max={d.max} value={sc?.[d.key] ?? 0}
                        onChange={e => update(a.id, { [d.key]: clampScore(e.target.value, d.max) } as Partial<TaskSS>)}
                        className={`${INPUT} mt-0.5`} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/50">小计：<strong className="text-white">{subtotal}</strong>/20</span>
                </div>
                <textarea rows={2} placeholder="评语（选填）" value={sc?.comment ?? ''}
                  onChange={e => update(a.id, { comment: e.target.value })} className={`${INPUT} mt-2`} />
              </div>
            );
          })}
          {safeArray(detail.taskAnswers).length === 0 && (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-xs text-white/48">暂无任务题答题明细</p>
          )}
        </div>
      )}
    </div>
  );
};

const InterestSection: React.FC<{
  detail: V11EvaluationDetail; open: boolean; onToggle: () => void;
  scores: Record<string, InterestSS>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, InterestSS>>>;
}> = ({ detail, open, onToggle, scores, setScores }) => {
  const update = (id: string, patch: Partial<InterestSS>) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };
  return (
    <div className="muchen-border-flow rounded-2xl p-4">
      <SectionHeader open={open} onToggle={onToggle} title="兴趣问卷" subtitle="满分 15 分" />
      {open && (
        <div className="mt-3 space-y-4">
          {safeArray(detail.interestAnswers).map(a => {
            const q: V11InterestQuestion | undefined = a.question;
            const maxScore = q?.score ?? 5;
            return (
              <div key={a.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm leading-6 text-white">{q?.questionText ?? MISSING_QUESTION_TEXT}</p>
                <div className="mt-1.5 rounded-lg border border-white/10 bg-black/24 px-2 py-1.5 text-sm text-white/76">{a.answer || '未作答'}</div>
                {!q && (
                  <p className="mt-2 text-xs leading-5 text-amber-200/80">
                    这条历史记录缺少兴趣题库关联，只展示已保存答案和分数。
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <label className="shrink-0 text-xs text-white/50">评分</label>
                  <input type="number" min={0} max={maxScore} value={scores[a.id]?.manualScore ?? 0}
                    onChange={e => update(a.id, { manualScore: clampScore(e.target.value, maxScore) })}
                    className={`${INPUT} w-20`} />
                  <span className="text-xs text-white/46">/ {maxScore}</span>
                </div>
                <textarea rows={2} placeholder="评语（选填）" value={scores[a.id]?.comment ?? ''}
                  onChange={e => update(a.id, { comment: e.target.value })} className={`${INPUT} mt-2`} />
              </div>
            );
          })}
          {safeArray(detail.interestAnswers).length === 0 && (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-xs text-white/48">暂无兴趣题答题明细</p>
          )}
        </div>
      )}
    </div>
  );
};

const V11ManualScoring: React.FC<V11ManualScoringProps> = ({ evaluations, onRefresh, onReportReady }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<V11EvaluationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sections, setSections] = useState({ basic: true, task: true, interest: true });
  const [basicScores, setBasicScores] = useState<Record<string, BasicSS>>({});
  const [taskScores, setTaskScores] = useState<Record<string, TaskSS>>({});
  const [interestScores, setInterestScores] = useState<Record<string, InterestSS>>({});

  const filtered = useMemo(
    () => safeArray(evaluations).filter(e => !statusFilter || e.status === statusFilter),
    [evaluations, statusFilter],
  );

  const resetSelection = () => {
    setSelectedId(null);
    setDetail(null);
    setBasicScores({});
    setTaskScores({});
    setInterestScores({});
  };

  const handleStatusFilterChange = (nextStatus: string) => {
    setStatusFilter(nextStatus);
    resetSelection();
  };

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    getV11EvaluationDetail(selectedId)
      .then(d => {
        if (cancelled) return;
        const normalized = {
          ...d,
          basicAnswers: safeArray(d.basicAnswers),
          taskAnswers: safeArray(d.taskAnswers),
          interestAnswers: safeArray(d.interestAnswers),
        };
        setDetail(normalized);
        const bs: Record<string, BasicSS> = {};
        normalized.basicAnswers.forEach(a => {
          const maxScore = a.question?.score ?? 25;
          bs[a.id] = { manualScore: clampNumber(a.manualScore ?? a.finalScore ?? a.autoScore, maxScore), comment: a.comment ?? '' };
        });
        setBasicScores(bs);
        const ts: Record<string, TaskSS> = {};
        normalized.taskAnswers.forEach(a => {
          ts[a.id] = {
            s1: clampNumber(a.scoreBasicUnderstanding, 4),
            s2: clampNumber(a.scoreAnalysisQuality, 6),
            s3: clampNumber(a.scoreStructureExpression, 4),
            s4: clampNumber(a.scoreApplicationLanding, 4),
            s5: clampNumber(a.scoreExtensionThinking, 2),
            comment: a.comment ?? '',
          };
        });
        setTaskScores(ts);
        const is: Record<string, InterestSS> = {};
        normalized.interestAnswers.forEach(a => { is[a.id] = { manualScore: clampNumber(a.manualScore ?? a.finalScore, a.question?.score ?? 5), comment: a.comment ?? '' }; });
        setInterestScores(is);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          toast.error('加载详情失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedId]);

  const calcBasic = (): number => {
    if (!detail) return 0;
    const total = safeArray(detail.basicAnswers).reduce((s, a) => {
      const questionType = a.question?.questionType ?? (a.isCorrect === null ? 'short_answer' : 'single_choice');
      if (questionType === 'short_answer') return s + (basicScores[a.id]?.manualScore ?? 0);
      return s + (a.autoScore ?? 0);
    }, 0);
    return Math.min(total, 25);
  };

  const calcTask = (): number =>
    Math.min(
      Object.values(taskScores).reduce((s, t) => s + (t.s1 ?? 0) + (t.s2 ?? 0) + (t.s3 ?? 0) + (t.s4 ?? 0) + (t.s5 ?? 0), 0),
      60,
    );

  const calcInterest = (): number =>
    Math.min(Object.values(interestScores).reduce((s, v) => s + (v.manualScore ?? 0), 0), 15);

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const dto: V11ReviewDto = {
        basicAnswers: safeArray(detail.basicAnswers)
          .filter(a => (a.question?.questionType ?? (a.isCorrect === null ? 'short_answer' : 'single_choice')) === 'short_answer')
          .map(a => ({ answerId: a.id, manualScore: basicScores[a.id]?.manualScore ?? 0, comment: basicScores[a.id]?.comment ?? '' })),
        taskAnswers: safeArray(detail.taskAnswers).map(a => ({
          answerId: a.id,
          scoreBasicUnderstanding: taskScores[a.id]?.s1 ?? 0,
          scoreAnalysisQuality: taskScores[a.id]?.s2 ?? 0,
          scoreStructureExpression: taskScores[a.id]?.s3 ?? 0,
          scoreApplicationLanding: taskScores[a.id]?.s4 ?? 0,
          scoreExtensionThinking: taskScores[a.id]?.s5 ?? 0,
          comment: taskScores[a.id]?.comment ?? '',
        })),
        interestAnswers: safeArray(detail.interestAnswers).map(a => ({
          answerId: a.id, manualScore: interestScores[a.id]?.manualScore ?? 0, comment: interestScores[a.id]?.comment ?? '',
        })),
      };
      const updatedRecord = await saveV11Review(detail.record.id, dto);
      setDetail((prev) => prev ? { ...prev, record: updatedRecord } : prev);
      toast.success('评分已保存');
      await onRefresh();
      onReportReady?.(updatedRecord.id);
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!detail) return;
    try {
      await generateV11Report(detail.record.id);
      toast.success('报告已生成');
      await onRefresh();
      onReportReady?.(detail.record.id);
    } catch {
      toast.error('生成报告失败');
    }
  };

  const toggleSection = (key: 'basic' | 'task' | 'interest') => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canGenerate = detail?.record.status === 'reviewed' || detail?.record.status === 'report_ready';
  const bTotal = calcBasic();
  const tTotal = calcTask();
  const iTtotal = calcInterest();

  return (
    <div
      className="muchen-border-flow min-h-[680px] overflow-hidden rounded-2xl"
      style={{
        display: 'grid',
        gridTemplateColumns: '288px minmax(0, 1fr)',
        alignItems: 'stretch',
      }}
    >
      <div
        className="w-72 shrink-0 border-r border-white/10 bg-black/24"
        style={{ width: 288, minWidth: 288, gridColumn: '1 / 2', overflow: 'hidden' }}
      >
        <div className="flex flex-wrap gap-1 border-b border-white/10 p-3">
          {STATUS_FILTERS.map(f => (
            <button key={f.key} onClick={() => handleStatusFilterChange(f.key)}
              className={`rounded-lg px-2 py-1 text-xs transition ${statusFilter === f.key ? 'bg-[#8b5cf6] text-white' : 'text-white/48 hover:bg-white/[0.07] hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {filtered.map((e, index) => (
            <div key={`${e.id}-${index}`} onClick={() => setSelectedId(e.id)}
              className={`cursor-pointer border-b border-white/10 p-3 transition-colors ${selectedId === e.id ? 'bg-white/[0.09]' : 'hover:bg-white/[0.055]'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{e.newcomerName}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadgeCls(e.status)}`}>
                  {STATUS_LABELS[e.status] ?? e.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-white/48">{e.targetRole}</div>
              <div className="mt-0.5 text-xs text-white/36">{e.assessmentDate}</div>
            </div>
          ))}
          {filtered.length === 0 && <p className="p-4 text-center text-xs text-white/48">暂无记录</p>}
        </div>
      </div>

      <div
        className="custom-scrollbar flex-1 overflow-y-auto pb-20"
        style={{
          minWidth: 0,
          gridColumn: '2 / 3',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 180px)',
        }}
      >
        {!selectedId && (
          <div className="flex h-full items-center justify-center text-sm text-white/48">请选择一条测评记录</div>
        )}
        {selectedId && loading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
          </div>
        )}
        {detail && !loading && (
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">{detail.record.newcomerName} — {detail.record.targetRole}</h2>
                <p className="mt-0.5 text-xs text-white/48">测评日期：{detail.record.assessmentDate} | 评分人：{detail.record.evaluatorName ?? '未分配'}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs ${statusBadgeCls(detail.record.status)}`}>
                {STATUS_LABELS[detail.record.status] ?? detail.record.status}
              </span>
            </div>
            <BasicSection detail={detail} open={sections.basic} onToggle={() => toggleSection('basic')} scores={basicScores} setScores={setBasicScores} />
            <TaskSection detail={detail} open={sections.task} onToggle={() => toggleSection('task')} scores={taskScores} setScores={setTaskScores} />
            <InterestSection detail={detail} open={sections.interest} onToggle={() => toggleSection('interest')} scores={interestScores} setScores={setInterestScores} />
          </div>
        )}
      </div>

      {detail && !loading && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-white/10 bg-black/72 px-6 py-3 shadow-[0_-18px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl lg:left-[210px]"
          style={{
            position: 'fixed',
            left: 210,
            right: 0,
            bottom: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-4 text-sm tabular-nums text-white/70">
            <span>基础 <strong>{bTotal}</strong>/25</span>
            <span className="text-white/36">+</span>
            <span>任务 <strong>{tTotal}</strong>/60</span>
            <span className="text-white/36">+</span>
            <span>兴趣 <strong>{iTtotal}</strong>/15</span>
            <span className="text-white/36">=</span>
            <span className="text-base font-semibold text-[#8fdcff]">总分 {bTotal + tTotal + iTtotal}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <button className={BTN_PRIMARY} disabled={saving} onClick={handleSave}>
              <span className="flex items-center gap-1.5"><Save className="h-3.5 w-3.5" />{saving ? '保存中...' : '保存评分'}</span>
            </button>
            <button className={BTN_SECONDARY} disabled={!canGenerate} onClick={handleGenerateReport}>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />生成报告</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default V11ManualScoring;
