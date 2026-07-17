import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  ArrowLeft, BookOpen, ClipboardList, BarChart3, FileText,
  ClipboardCheck, Bell, Bot, Shield, Eye, Compass, Database, Settings,
  PenTool, FileBarChart, Users,
} from 'lucide-react';
import {
  getAdminQuestions, getAdminScoringRules, getAdminTrainingResources,
  getAdminRecords, getAdminStats, updateAdminQuestion, getReviewDetails,
  getNotifications,
} from '../../api/assessment';
import {
  getAdminMaterials, getAdminRuleQuestions, getAdminProgress,
} from '../../api/onboarding';
import { getV11Evaluations, getV11Reports } from '../../api/v11';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import type { DemoRole } from '../../hooks/useDemoRole';
import type {
  QuestionItem, ScoringRuleItem, TrainingResourceItem,
  AssessmentRecord, AssessmentStats, ReviewDetailItem, NotificationItem,
  OnboardingMaterial, OnboardingRuleQuestion, OnboardingProgressItem,
  V11EvaluationRecord, V11AssessmentReport, PaginatedResponse,
} from '@shared/api.interface';
import QuestionTab from './QuestionTab';
import NotificationsTab from './NotificationsTab';
import AiSettingsTab from './AiSettingsTab';
import PermissionTab from './PermissionTab';
import RecordDetailModal from './RecordDetailModal';
import OnboardingTab from './OnboardingTab';
import DataSourceSettings from './DataSourceSettings';
import AssessmentConfigV11 from './AssessmentConfigV11';
import V11ManualScoring from './V11ManualScoring';
import V11ReportCenter from './V11ReportCenter';
import V11ScoreSummary from './V11ScoreSummary';
import TrainingResources from './TrainingResources';
import AdminLogin from './AdminLogin';
import TalentAgentMvp from './TalentAgentMvp';

type TabKey = 'talent-agent' | 'datasource' | 'v11-config' | 'v11-scoring' | 'v11-summary' | 'v11-reports' | 'training-resources' | 'questions' | 'rules' | 'resources' | 'records' | 'review' | 'notifications' | 'ai-settings' | 'onboarding' | 'permissions';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'talent-agent', label: '人才 Agent', icon: <Users className="h-4 w-4" /> },
  { key: 'datasource', label: '数据源设置', icon: <Database className="h-4 w-4" /> },
  { key: 'v11-config', label: '测评配置 V1.1', icon: <Settings className="h-4 w-4" /> },
  { key: 'v11-scoring', label: '人工评分', icon: <PenTool className="h-4 w-4" /> },
  { key: 'v11-summary', label: '评分汇总', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'v11-reports', label: '报告中心', icon: <FileBarChart className="h-4 w-4" /> },
  { key: 'training-resources', label: '材料管理', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'questions', label: '题库管理', icon: <ClipboardList className="h-4 w-4" /> },
  { key: 'rules', label: '评分规则', icon: <FileText className="h-4 w-4" /> },
  { key: 'resources', label: '培训资源', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'records', label: '测评记录', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'review', label: '人工复核', icon: <ClipboardCheck className="h-4 w-4" /> },
  { key: 'notifications', label: '通知中心', icon: <Bell className="h-4 w-4" /> },
  { key: 'ai-settings', label: '智能体设置', icon: <Bot className="h-4 w-4" /> },
  { key: 'onboarding', label: '项目引导', icon: <Compass className="h-4 w-4" /> },
  { key: 'permissions', label: '权限说明', icon: <Shield className="h-4 w-4" /> },
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAdminAuth();
  const role: DemoRole = isAuthenticated ? 'admin' : 'newcomer';
  const setRole = (_nextRole: DemoRole) => undefined;
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const queryTab = new URLSearchParams(window.location.search).get('tab') as TabKey | null;
    return queryTab && TABS.some((tab) => tab.key === queryTab) ? queryTab : 'v11-scoring';
  });
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [rules, setRules] = useState<ScoringRuleItem[]>([]);
  const [resources, setResources] = useState<TrainingResourceItem[]>([]);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewDetailItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [onboardingMaterials, setOnboardingMaterials] = useState<OnboardingMaterial[]>([]);
  const [onboardingRuleQuestions, setOnboardingRuleQuestions] = useState<OnboardingRuleQuestion[]>([]);
  const [onboardingProgressList, setOnboardingProgressList] = useState<OnboardingProgressItem[]>([]);
  const [v11Evaluations, setV11Evaluations] = useState<V11EvaluationRecord[]>([]);
  const [v11Reports, setV11Reports] = useState<V11AssessmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
  const [selectedReportRecordId, setSelectedReportRecordId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const safe = async <T,>(label: string, promise: Promise<T>, fallback: T): Promise<T> => {
        try {
          return await promise;
        } catch (err) {
          logger.error(`Failed to load ${label}`, err);
          return fallback;
        }
      };
      // The current console is V1.1-based. Legacy assessment/onboarding endpoints can
      // be unavailable in deployment, so avoid loading them on every admin entry.
      const [v11EvalRes, v11RepRes] = await Promise.all([
        safe('v11 evaluations', getV11Evaluations(), [] as V11EvaluationRecord[]),
        safe('v11 reports', getV11Reports(), [] as V11AssessmentReport[]),
      ]);
      setQuestions([]);
      setRules([]);
      setResources([]);
      setRecords([]);
      setStats(null);
      setReviewItems([]);
      setNotifications([]);
      setOnboardingMaterials([]);
      setOnboardingRuleQuestions([]);
      setOnboardingProgressList([]);
      setV11Evaluations(v11EvalRes);
      setV11Reports(v11RepRes);
    } catch (err) {
      logger.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get('tab') as TabKey | null;
    if (queryTab && TABS.some((tab) => tab.key === queryTab)) {
      setActiveTab(queryTab);
    } else {
      setActiveTab((prev) => (prev === 'talent-agent' ? 'v11-scoring' : prev));
    }
  }, [location.search]);

  const refreshOnboarding = async () => {
    try {
      const [matRes, rqRes, progRes] = await Promise.all([
        getAdminMaterials(),
        getAdminRuleQuestions(),
        getAdminProgress(),
      ]);
      setOnboardingMaterials(matRes);
      setOnboardingRuleQuestions(rqRes);
      setOnboardingProgressList(progRes);
    } catch (err) {
      logger.error('Failed to refresh onboarding data', err);
    }
  };

  const v11PendingCount = v11Evaluations.filter((item) => item.status === 'pending_review').length;

  const handleToggleQuestion = async (id: string, enabled: boolean) => {
    try {
      const updated = await updateAdminQuestion(id, { isEnabled: !enabled });
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, isEnabled: updated.isEnabled } : q)),
      );
    } catch (err) {
      logger.error('Failed to toggle question', err);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => navigate('/admin', { replace: true })} />;
  }

  if (role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-8 text-center">
          <Eye className="mx-auto mb-3 h-8 w-8 text-white/46" />
          <p className="text-lg font-semibold text-white">无权限访问</p>
          <p className="mt-2 text-sm text-white/52">
            仅管理员（admin）角色可访问后台管理。
            <br />
            请使用管理员账号登录后台。
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/" className="muchen-secondary-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
              <ArrowLeft className="h-3 w-3" />
              返回测评
            </Link>
            <button
              onClick={() => setRole('admin')}
              className="muchen-primary-btn rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              切换为管理员
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'talent-agent') {
    return (
      <div className="mx-auto max-w-[1240px] py-4">
        <TalentAgentMvp />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
          <p className="text-sm text-white/56">加载管理数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1480px] px-1 py-6">
      <div className="muchen-border-flow muchen-border-flow-active mb-6 flex items-center justify-between rounded-2xl p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#65c7ff]">Admin Console</p>
          <h1 className="mt-2 text-2xl font-bold text-white">AI 内容编导能力评估后台</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-white/50 sm:inline">
            当前角色: <span className="font-medium text-[#8fdcff]">admin</span>
          </span>
          <Link to="/" className="muchen-secondary-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
            <ArrowLeft className="h-3 w-3" />
            返回测评
          </Link>
        </div>
      </div>

      <div className="muchen-glass mb-6 flex flex-wrap gap-1 rounded-2xl p-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.key === 'talent-agent') {
                navigate('/admin?tab=talent-agent');
                return;
              }
              setActiveTab(tab.key);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors ${
              activeTab === tab.key
                ? 'bg-white/[0.1] font-medium text-white shadow-[0_12px_28px_rgba(82,91,255,0.14)]'
                : 'text-white/48 hover:bg-white/[0.055] hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === 'review' && reviewItems.length > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0 text-[10px] text-white">
                {reviewItems.length}
              </span>
            )}
            {tab.key === 'v11-scoring' && v11PendingCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0 text-[10px] text-white">
                {v11PendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'datasource' && <DataSourceSettings />}
      {activeTab === 'v11-config' && <AssessmentConfigV11 />}
      {activeTab === 'v11-scoring' && (
        <V11ManualScoring
          evaluations={v11Evaluations}
          onRefresh={fetchData}
          onReportReady={(recordId) => {
            setSelectedReportRecordId(recordId);
            setActiveTab('v11-reports');
          }}
        />
      )}
      {activeTab === 'v11-summary' && (
        <V11ScoreSummary evaluations={v11Evaluations} reports={v11Reports} />
      )}
      {activeTab === 'v11-reports' && (
        <V11ReportCenter
          reports={v11Reports}
          evaluations={v11Evaluations}
          onRefresh={fetchData}
          selectedRecordId={selectedReportRecordId}
        />
      )}
      {activeTab === 'questions' && (
        <QuestionTab questions={questions} onToggle={handleToggleQuestion} onRefresh={fetchData} />
      )}
      {activeTab === 'rules' && <RulesTab rules={rules} />}
      {activeTab === 'resources' && <ResourcesTab resources={resources} />}
      {activeTab === 'records' && (
        <RecordsTab records={records} stats={stats} onViewDetail={(id) => setDetailRecordId(id)} />
      )}
      {activeTab === 'review' && (
        <ReviewOverviewTab
          reviewItems={reviewItems}
          v11PendingCount={v11PendingCount}
          onOpenV11Scoring={() => setActiveTab('v11-scoring')}
        />
      )}
      {activeTab === 'notifications' && <NotificationsTab notifications={notifications} />}
      {activeTab === 'ai-settings' && <AiSettingsTab />}
      {activeTab === 'onboarding' && (
        <OnboardingTab
          materials={onboardingMaterials}
          ruleQuestions={onboardingRuleQuestions}
          progressList={onboardingProgressList}
          onRefresh={refreshOnboarding}
        />
      )}
      {activeTab === 'training-resources' && <TrainingResources />}
      {activeTab === 'permissions' && <PermissionTab currentRole={role} onSwitchRole={setRole} />}

      {detailRecordId && (
        <RecordDetailModal recordId={detailRecordId} onClose={() => setDetailRecordId(null)} />
      )}
    </div>
  );
};

const RulesTab: React.FC<{ rules: ScoringRuleItem[] }> = ({ rules }) => (
  <div className="muchen-border-flow rounded-2xl">
    <div className="border-b border-white/10 px-6 py-4">
      <h2 className="text-sm font-semibold text-white">评分规则</h2>
      <p className="mt-1 text-xs text-white/50">各维度和题型的评分标准</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.035]">
            <th className="px-4 py-2.5 text-left font-medium text-white/50">维度</th>
            <th className="px-4 py-2.5 text-left font-medium text-white/50">题型</th>
            <th className="px-4 py-2.5 text-left font-medium text-white/50">评分标准</th>
            <th className="px-4 py-2.5 text-center font-medium text-white/50">复核阈值</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-b border-white/10 last:border-0">
              <td className="px-4 py-2.5 text-xs">{r.dimensionName}</td>
              <td className="px-4 py-2.5"><span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-xs">{r.questionType}</span></td>
              <td className="max-w-sm px-4 py-2.5 text-xs text-white/56">{r.scoringCriteria}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-xs">{r.reviewThreshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ResourcesTab: React.FC<{ resources: TrainingResourceItem[] }> = ({ resources }) => (
  <div className="muchen-border-flow rounded-2xl">
    <div className="border-b border-white/10 px-6 py-4">
      <h2 className="text-sm font-semibold text-white">培训资源</h2>
      <p className="mt-1 text-xs text-white/50">各维度的培训课程和实操任务</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.035]">
            <th className="px-4 py-2.5 text-left font-medium text-white/50">资源名称</th>
            <th className="px-4 py-2.5 text-left font-medium text-white/50">类型</th>
            <th className="px-4 py-2.5 text-left font-medium text-white/50">维度</th>
            <th className="px-4 py-2.5 text-left font-medium text-white/50">适用档位</th>
            <th className="px-4 py-2.5 text-center font-medium text-white/50">周期(天)</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="border-b border-white/10 last:border-0">
              <td className="px-4 py-2.5 text-xs font-medium">{r.resourceName}</td>
              <td className="px-4 py-2.5"><span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-xs">{r.resourceType}</span></td>
              <td className="px-4 py-2.5 text-xs">{r.dimensionName}</td>
              <td className="px-4 py-2.5 text-xs">{r.applicableGrade}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-xs">{r.studyDurationDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RecordsTab: React.FC<{
  records: AssessmentRecord[];
  stats: AssessmentStats | null;
  onViewDetail: (id: string) => void;
}> = ({ records, stats, onViewDetail }) => (
  <div className="space-y-6">
    {stats && (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="测评总数" value={String(stats.totalAssessments)} />
        <StatCard label="平均分" value={String(stats.averageScore)} />
        <StatCard label="骨干培养" value={String(stats.gradeDistribution.find((g) => g.grade === '骨干培养')?.count ?? 0)} />
        <StatCard label="入门补强" value={String(stats.gradeDistribution.find((g) => g.grade === '入门补强')?.count ?? 0)} />
      </div>
    )}
    <div className="muchen-border-flow rounded-2xl">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-sm font-semibold text-white">测评记录</h2>
        <p className="mt-1 text-xs text-white/50">最近 {records.length} 条测评记录</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.035]">
              <th className="px-4 py-2.5 text-left font-medium text-white/50">姓名</th>
              <th className="px-4 py-2.5 text-left font-medium text-white/50">岗位</th>
              <th className="px-4 py-2.5 text-center font-medium text-white/50">总分</th>
              <th className="px-4 py-2.5 text-left font-medium text-white/50">推荐档位</th>
              <th className="px-4 py-2.5 text-left font-medium text-white/50">状态</th>
              <th className="px-4 py-2.5 text-left font-medium text-white/50">时间</th>
              <th className="px-4 py-2.5 text-center font-medium text-white/50">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-2.5 text-xs font-medium">{r.name}</td>
                <td className="px-4 py-2.5 text-xs">{r.position}</td>
                <td className="px-4 py-2.5 text-center tabular-nums text-xs">{r.totalScore ?? '-'}</td>
                <td className="px-4 py-2.5">
                  {r.recommendedGrade && (
                    <span className={`rounded-sm px-1.5 py-0.5 text-xs ${gradeBadgeClass(r.recommendedGrade)}`}>
                      {r.recommendedGrade}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-sm px-1.5 py-0.5 text-xs ${statusBadgeClass(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-white/50">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => onViewDetail(r.id)}
                    className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-white/56 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    详情
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white/50">暂无测评记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ReviewOverviewTab: React.FC<{
  reviewItems: ReviewDetailItem[];
  v11PendingCount: number;
  onOpenV11Scoring: () => void;
}> = ({ reviewItems, v11PendingCount, onOpenV11Scoring }) => (
  <div className="space-y-4">
    {v11PendingCount > 0 && (
      <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">V1.1 测评有 {v11PendingCount} 条待人工评分</p>
            <p className="mt-1 text-xs text-white/52">
              当前“人工复核”仅用于旧版主观题复核；新人五维测评请在“人工评分”中处理。
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenV11Scoring}
            className="muchen-primary-btn shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold"
          >
            去人工评分
          </button>
        </div>
      </div>
    )}
    <div className="muchen-border-flow rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">人工复核概览</h2>
          <p className="mt-1 text-xs text-white/52">
            共 <span className="font-semibold text-[hsl(0_65%_48%)]">{reviewItems.length}</span> 道主观题待复核
          </p>
        </div>
        {reviewItems.length > 0 && (
          <Link
            to="/review"
            className="muchen-primary-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          >
            <ClipboardCheck className="h-3 w-3" />
            进入复核
          </Link>
        )}
      </div>
    </div>
    {reviewItems.length === 0 && (
      <div className="muchen-border-flow rounded-2xl p-12 text-center">
        <ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-[hsl(152_55%_38%)]" />
        <p className="text-sm font-medium text-white">暂无待复核题目</p>
        <p className="mt-1 text-xs text-white/52">所有主观题已完成复核或尚无提交</p>
      </div>
    )}
    {reviewItems.length > 0 && (
      <div className="muchen-border-flow rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.035]">
                <th className="px-4 py-2.5 text-left font-medium text-white/50">测评人</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/50">题号</th>
                <th className="max-w-xs px-4 py-2.5 text-left font-medium text-white/50">题干</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/50">维度</th>
                <th className="px-4 py-2.5 text-center font-medium text-white/50">自动分</th>
                <th className="px-4 py-2.5 text-center font-medium text-white/50">置信度</th>
              </tr>
            </thead>
            <tbody>
              {reviewItems.slice(0, 20).map((item) => (
                <tr key={item.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-2.5 text-xs font-medium">{item.assessmentName}</td>
                  <td className="px-4 py-2.5 tabular-nums text-xs">{item.questionNumber}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-xs text-white/52">{item.stem}</td>
                  <td className="px-4 py-2.5 text-xs">{item.dimensionName ?? '-'}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-xs">{item.autoScore}/{item.maxScore}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-xs">
                    {item.confidence !== null ? `${Math.round(item.confidence * 100)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="muchen-border-flow rounded-2xl p-4">
    <p className="text-xs text-white/50">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums text-[#8fdcff]">{value}</p>
  </div>
);

function gradeBadgeClass(grade: string): string {
  switch (grade) {
    case '骨干培养': return 'border border-emerald-300/25 bg-emerald-400/12 text-emerald-200';
    case '岗位进阶': return 'border border-sky-300/25 bg-sky-400/12 text-sky-200';
    case '基础执行': return 'border border-amber-300/25 bg-amber-400/12 text-amber-200';
    case '入门补强': return 'border border-red-300/25 bg-red-400/12 text-red-200';
    default: return 'border border-white/10 bg-white/[0.055] text-white/56';
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case '已完成': return 'border border-emerald-300/25 bg-emerald-400/12 text-emerald-200';
    case '待复核': return 'border border-amber-300/25 bg-amber-400/12 text-amber-200';
    case '已复核': return 'border border-sky-300/25 bg-sky-400/12 text-sky-200';
    default: return 'border border-white/10 bg-white/[0.055] text-white/56';
  }
}

export default AdminPage;
