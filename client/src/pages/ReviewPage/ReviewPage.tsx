import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { ArrowLeft, CheckCircle2, Edit3, Save } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import type { DemoRole } from '../../hooks/useDemoRole';
import { getReviewDetails, completeReview } from '../../api/assessment';
import type { ReviewDetailItem } from '@shared/api.interface';
import AdminLogin from '../AdminPage/AdminLogin';

const ReviewPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const role: DemoRole = isAuthenticated ? 'admin' : 'newcomer';
  const navigate = useNavigate();
  const [items, setItems] = useState<ReviewDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviewDetails();
      setItems(data);
    } catch (err) {
      logger.error('Failed to load review details', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => navigate('/review', { replace: true })} />;
  }

  if (role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold text-white">无权限访问</p>
          <p className="mt-2 text-sm text-white/52">仅 admin 和 reviewer 角色可访问复核页面</p>
          <Link
            to="/"
            className="muchen-primary-btn mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-3 w-3" />
            返回测评页
          </Link>
        </div>
      </div>
    );
  }

  const handleStartEdit = (item: ReviewDetailItem) => {
    setEditingId(item.id);
    setEditScore(item.autoScore);
    setEditReason(item.scoringReason ?? '');
  };

  const handleSaveReview = async (detailId: string) => {
    setSaving(true);
    try {
      const result = await completeReview({
        detailId,
        reviewedScore: editScore,
        reviewedReason: editReason,
      });
      logger.info(`Review completed for ${detailId}, record status: ${result.recordStatus}`);
      setEditingId(null);
      await fetchData();
      if (result.recordStatus === '已复核') {
        navigate('/admin');
      }
    } catch (err) {
      logger.error('Failed to complete review', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
          <p className="text-sm text-white/56">加载复核数据...</p>
        </div>
      </div>
    );
  }

  const groupedByAssessment = items.reduce<Record<string, ReviewDetailItem[]>>((acc, item) => {
    const key = item.assessmentId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-1 py-6">
      <div className="muchen-border-flow muchen-border-flow-active mb-6 flex items-center justify-between rounded-2xl p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#65c7ff]">Review Console</p>
          <h1 className="mt-2 text-2xl font-bold text-white">AI 内容编导能力评估 — 人工复核</h1>
        </div>
        <Link
          to="/"
          className="muchen-secondary-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          返回测评
        </Link>
      </div>

      <div className="muchen-border-flow mb-4 rounded-2xl p-4">
        <p className="text-sm text-white/52">
          共 <span className="font-semibold text-[#8fdcff]">{items.length}</span> 道主观题待复核
        </p>
      </div>

      {items.length === 0 && (
        <div className="muchen-border-flow rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[hsl(152_55%_38%)]" />
          <p className="text-sm font-medium text-white">暂无待复核题目</p>
          <p className="mt-1 text-xs text-white/52">所有主观题已完成复核</p>
        </div>
      )}

      {Object.entries(groupedByAssessment).map(([assessmentId, group]) => (
        <div key={assessmentId} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-white">
            {group[0]?.assessmentName} 的待复核题目
          </h2>
          <div className="space-y-3">
            {group.map((item) => (
              <div
                key={item.id}
                className="muchen-border-flow rounded-2xl p-5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-xs text-white/52">
                        第{item.questionNumber}题
                      </span>
                      {item.dimensionName && (
                        <span className="text-xs text-white/52">{item.dimensionName}</span>
                      )}
                      <span className="text-xs text-white/52">
                        置信度: {item.confidence !== null ? `${Math.round(item.confidence * 100)}%` : '-'}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-6 text-white">{item.stem}</p>
                  </div>
                  {editingId !== item.id && (
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="muchen-secondary-btn ml-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs"
                    >
                      <Edit3 className="h-3 w-3" />
                      编辑
                    </button>
                  )}
                </div>

                <div className="mb-3 rounded-xl border border-white/10 bg-black/24 p-3">
                  <p className="mb-1 text-xs text-white/46">新人答案</p>
                  <p className="text-sm leading-6 text-white/78">{item.submittedAnswer}</p>
                </div>

                <div className="mb-2 flex items-center gap-4 text-xs text-white/52">
                  <span>自动评分: <span className="font-medium text-white">{item.autoScore}</span>/{item.maxScore}</span>
                  <span>评分理由: {item.scoringReason ?? '-'}</span>
                </div>

                {editingId === item.id && (
                  <div className="mt-4 rounded-2xl border border-[#7b4dff]/24 bg-[#7b4dff]/8 p-4">
                    <div className="mb-3 flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-white/56">
                        复核分数:
                        <input
                          type="number"
                          min={0}
                          max={item.maxScore}
                          value={editScore}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditScore(Number(e.target.value))}
                          className="muchen-input w-16 rounded-lg px-2 py-1 text-sm"
                        />
                        <span className="text-white/46">/ {item.maxScore}</span>
                      </label>
                    </div>
                    <label className="mb-3 block text-xs text-white/56">
                      评分理由:
                      <textarea
                        value={editReason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditReason(e.target.value)}
                        rows={3}
                        className="muchen-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
                        placeholder="请输入复核后的评分理由..."
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveReview(item.id)}
                        disabled={saving}
                        className="muchen-primary-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        <Save className="h-3 w-3" />
                        {saving ? '保存中...' : '复核完成'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="muchen-secondary-btn rounded-lg px-3 py-1.5 text-xs"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewPage;
