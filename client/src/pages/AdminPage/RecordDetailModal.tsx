import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, Clock } from 'lucide-react';
import { getRecordDetail } from '../../api/assessment';
import type { RecordDetail } from '@shared/api.interface';

function gradeBadgeClass(grade: string): string {
  switch (grade) {
    case '骨干培养': return 'bg-[hsl(152_55%_92%)] text-[hsl(152_55%_30%)]';
    case '岗位进阶': return 'bg-[hsl(213_52%_92%)] text-[hsl(213_52%_35%)]';
    case '基础执行': return 'bg-[hsl(33_85%_92%)] text-[hsl(33_85%_35%)]';
    case '入门补强': return 'bg-[hsl(0_65%_92%)] text-[hsl(0_65%_40%)]';
    default: return 'bg-muted text-muted-foreground';
  }
}

const RecordDetailModal: React.FC<{
  recordId: string;
  onClose: () => void;
}> = ({ recordId, onClose }) => {
  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecordDetail(recordId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [recordId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex flex-col items-center rounded-sm border border-border bg-card p-8 shadow-lg">
          <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">加载详情...</p>
        </div>
      </div>
    );
  }

  if (!detail) return null;
  const { record, answerDetails, notifications } = detail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            测评详情 — {record.name}（{record.position}）
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="rounded-sm bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">总分</p>
            <p className="text-lg font-bold tabular-nums text-primary">{record.totalScore ?? '-'}</p>
          </div>
          <div className="rounded-sm bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">档位</p>
            <p className="text-sm font-medium">
              {record.recommendedGrade && (
                <span className={`rounded-sm px-1.5 py-0.5 text-xs ${gradeBadgeClass(record.recommendedGrade)}`}>
                  {record.recommendedGrade}
                </span>
              )}
            </p>
          </div>
          <div className="rounded-sm bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">状态</p>
            <p className="text-sm font-medium">{record.status}</p>
          </div>
          <div className="rounded-sm bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">提交时间</p>
            <p className="text-xs">{record.createdAt ? new Date(record.createdAt).toLocaleDateString('zh-CN') : '-'}</p>
          </div>
        </div>

        {record.aiSummary && (
          <div className="mb-4 rounded-sm border border-border bg-muted/10 p-3">
            <p className="mb-1 text-xs font-medium text-foreground">智能总结</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{record.aiSummary}</p>
          </div>
        )}

        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold text-foreground">
            答题明细（{answerDetails.length} 题）
          </h4>
          <div className="max-h-[300px] overflow-y-auto rounded-sm border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">题号</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">题型</th>
                  <th className="max-w-[200px] px-3 py-2 text-left font-medium text-muted-foreground">题干</th>
                  <th className="max-w-[150px] px-3 py-2 text-left font-medium text-muted-foreground">答案</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">得分</th>
                  <th className="max-w-[150px] px-3 py-2 text-left font-medium text-muted-foreground">评分理由</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">复核</th>
                </tr>
              </thead>
              <tbody>
                {answerDetails.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 tabular-nums">{d.questionNumber}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-sm bg-muted px-1 py-0.5">{d.questionType}</span>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">{d.stem}</td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-muted-foreground">{d.submittedAnswer}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{d.autoScore}/{d.maxScore}</td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-muted-foreground">{d.scoringReason ?? '-'}</td>
                    <td className="px-3 py-2 text-center">
                      {d.needsReview ? (
                        <span className="rounded-sm bg-[hsl(33_85%_92%)] px-1 py-0.5 text-[hsl(33_85%_35%)]">待复核</span>
                      ) : (
                        <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-[hsl(152_55%_38%)]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {notifications.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Bell className="h-3 w-3" />
              关联通知（{notifications.length} 条）
            </h4>
            <div className="space-y-1.5">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center gap-2 rounded-sm bg-muted/20 px-3 py-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">— {n.content}</span>
                  <span className="ml-auto rounded-sm bg-[hsl(33_85%_92%)] px-1.5 py-0.5 text-xs text-[hsl(33_85%_35%)]">
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordDetailModal;
