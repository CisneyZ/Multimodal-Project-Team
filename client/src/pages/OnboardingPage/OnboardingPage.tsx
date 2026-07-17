import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, ClipboardCheck } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import OnboardingSteps from './OnboardingSteps';
import MaterialList from './MaterialList';
import RuleTestSection from './RuleTestSection';
import ChatAssistant from './ChatAssistant';
import * as onboardingApi from '../../api/onboarding';
import type {
  OnboardingMaterial,
  OnboardingRuleQuestion,
  OnboardingProgressItem,
  SubmitRuleTestResponse,
} from '@shared/api.interface';

type ProgressStatus =
  | 'background_pending'
  | 'background_done'
  | 'rules_pending'
  | 'rules_done'
  | 'rule_test_done'
  | 'waiting_admin';

function statusToStep(status: ProgressStatus): number {
  const map: Record<ProgressStatus, number> = {
    background_pending: 1,
    background_done: 2,
    rules_pending: 3,
    rules_done: 4,
    rule_test_done: 5,
    waiting_admin: 5,
  };
  return map[status] ?? 0;
}

const OnboardingPage = () => {
  const [searchParams] = useSearchParams();
  const autoStartedRef = useRef(false);

  const urlName = searchParams.get('name') || '';
  const urlTargetRole = searchParams.get('targetRole') || '';
  const urlAssessmentId = searchParams.get('assessmentRecordId') || '';

  const [name, setName] = useState(urlName);
  const [nameError, setNameError] = useState('');
  const [progress, setProgress] = useState<OnboardingProgressItem | null>(null);
  const [backgroundMaterials, setBackgroundMaterials] = useState<OnboardingMaterial[]>([]);
  const [ruleDocuments, setRuleDocuments] = useState<OnboardingMaterial[]>([]);
  const [ruleQuestions, setRuleQuestions] = useState<OnboardingRuleQuestion[]>([]);
  const [ruleTestResult, setRuleTestResult] = useState<SubmitRuleTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentStep = progress ? statusToStep(progress.status as ProgressStatus) : 0;

  useEffect(() => {
    if (!progress) return;
    loadMaterials();
    if (
      progress.status === 'rules_done' ||
      progress.status === 'rule_test_done' ||
      progress.status === 'waiting_admin'
    ) {
      loadQuestions();
    }
  }, [progress?.status]);

  useEffect(() => {
    if (!progress || progress.status !== 'background_done') return;
    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled) return;
      onboardingApi
        .getProgressById(progress.id)
        .then((fresh) => {
          if (cancelled) return;
          if (fresh.status !== 'background_done') {
            setProgress(fresh);
          }
        })
        .catch(() => {});
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [progress?.id, progress?.status]);

  useEffect(() => {
    if (autoStartedRef.current) return;
    if (urlName && !progress) {
      autoStartedRef.current = true;
      setLoading(true);
      onboardingApi
        .startProgress({
          newcomerName: urlName,
          targetRole: urlTargetRole,
          ...(urlAssessmentId ? { assessmentRecordId: urlAssessmentId } : {}),
        })
        .then((result) => {
          setProgress(result);
        })
        .catch((err) => {
          logger.error('Auto-start onboarding failed', err);
          setError('启动引导失败，请重试');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [urlName, urlTargetRole, urlAssessmentId, progress]);

  async function loadMaterials() {
    try {
      const allMaterials = await onboardingApi.getMaterials();
      setBackgroundMaterials(allMaterials.filter((m) => m.materialType === 'project_background'));
      setRuleDocuments(allMaterials.filter((m) => m.materialType === 'rule_document'));
    } catch (err) {
      logger.error('Failed to load materials', err);
      setError('加载材料失败，请刷新重试');
    }
  }

  async function loadQuestions() {
    try {
      const questions = await onboardingApi.getRuleQuestions();
      setRuleQuestions(questions);
    } catch (err) {
      logger.error('Failed to load questions', err);
      setError('加载测试题失败，请刷新重试');
    }
  }

  async function handleStart() {
    if (!name.trim()) {
      setNameError('请输入你的姓名');
      return;
    }
    setNameError('');
    setLoading(true);
    setError('');
    try {
      const result = await onboardingApi.startProgress({
        newcomerName: name.trim(),
        targetRole: urlTargetRole || '',
        ...(urlAssessmentId ? { assessmentRecordId: urlAssessmentId } : {}),
      });
      setProgress(result);
    } catch (err) {
      logger.error('Failed to start onboarding', err);
      setError('启动引导失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteBackground() {
    if (!progress) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await onboardingApi.completeBackground(progress.id);
      setProgress(updated);
      await loadMaterials();
    } catch (err) {
      logger.error('Failed to complete background', err);
      setError('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteRules() {
    if (!progress) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await onboardingApi.completeRules(progress.id);
      setProgress(updated);
      await loadQuestions();
    } catch (err) {
      logger.error('Failed to complete rules', err);
      setError('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitTest(answers: { questionId: string; answer: string }[]) {
    if (!progress) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await onboardingApi.submitRuleTest({
        progressId: progress.id,
        answers,
      });
      setRuleTestResult(result);
      setProgress({ ...progress, status: 'rule_test_done' });
    } catch (err) {
      logger.error('Failed to submit test', err);
      setError('提交测试失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          项目引导助手
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          帮助新成员快速了解项目背景与团队规则，完成入职引导流程
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <OnboardingSteps currentStep={currentStep} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-sm border border-[hsl(0_65%_48%)]/30 bg-[hsl(0_65%_48%)]/5 p-4">
          <p className="text-sm text-[hsl(0_65%_48%)]">{error}</p>
        </div>
      )}

      {/* Step 0: Name input */}
      {!progress && (
        <div className="rounded-sm border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            开始引导
          </h2>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              你的姓名
            </label>
            <Input
              placeholder="请输入你的姓名"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              className={nameError ? 'border-destructive' : ''}
            />
            {nameError && (
              <p className="mt-1 text-xs text-destructive">{nameError}</p>
            )}
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            开始引导流程
          </Button>
        </div>
      )}

      {/* Step 1: Background materials */}
      {progress && progress.status === 'background_pending' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                项目背景材料
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              请仔细阅读以下项目背景材料，了解项目的基本信息和业务逻辑。
            </p>
            <MaterialList materials={backgroundMaterials} type="project_background" />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleCompleteBackground}
            disabled={submitting || backgroundMaterials.length === 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            已阅读完毕，进入下一步
          </Button>
        </div>
      )}

      {/* Step 2/3: Waiting for admin or rule documents */}
      {progress &&
        (progress.status === 'background_done' ||
          progress.status === 'rules_pending') && (
          <div className="flex flex-col gap-6">
            {progress.status === 'background_done' && (
              <div className="rounded-sm border border-border bg-card p-6 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  项目背景材料已阅读完毕，等待管理员安排下一步。
                </p>
              </div>
            )}
            {progress.status === 'rules_pending' && (
              <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    团队规则文档
                  </h2>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  请仔细阅读以下规则文档，了解团队的工作规范和流程要求。
                </p>
                <MaterialList materials={ruleDocuments} type="rule_document" />
                <div className="mt-6">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleCompleteRules}
                    disabled={submitting || ruleDocuments.length === 0}
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    已阅读完毕，进入规则测试
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Step 4: Rule test */}
      {progress && progress.status === 'rules_done' && (
        <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              规则测试
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            请根据之前阅读的规则文档完成以下测试题。
          </p>
          <RuleTestSection
            questions={ruleQuestions}
            onSubmit={handleSubmitTest}
            result={ruleTestResult}
            submitting={submitting}
          />
        </div>
      )}

      {/* Step 5: Results & waiting */}
      {progress &&
        (progress.status === 'rule_test_done' ||
          progress.status === 'waiting_admin') && (
          <div className="flex flex-col gap-6">
            {ruleTestResult && (
              <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  测试结果
                </h2>
                {(() => {
                  const passed = ruleTestResult.totalScore >= ruleTestResult.maxScore * 0.6;
                  return (
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-3xl font-semibold tabular-nums ${
                          passed
                            ? 'text-[hsl(152_55%_38%)]'
                            : 'text-[hsl(0_65%_48%)]'
                        }`}
                      >
                        {ruleTestResult.totalScore}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {ruleTestResult.maxScore}
                      </span>
                      <span
                        className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                          passed
                            ? 'bg-[hsl(152_55%_38%)]/10 text-[hsl(152_55%_38%)]'
                            : 'bg-[hsl(0_65%_48%)]/10 text-[hsl(0_65%_48%)]'
                        }`}
                      >
                        {passed ? '通过' : '未通过'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="rounded-sm border border-border bg-card p-6 text-center shadow-sm">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                测试已完成，等待管理员确认。
              </p>
            </div>
          </div>
        )}
      <ChatAssistant progress={progress} />
    </div>
  );
};

export default OnboardingPage;
