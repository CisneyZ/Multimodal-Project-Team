import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { logger } from '@lark-apaas/client-toolkit/logger';
import V11InfoForm from './V11InfoForm';
import V11InterestSurvey from './V11InterestSurvey';
import V11BasicTest from './V11BasicTest';
import V11TaskAssessment from './V11TaskAssessment';
import V11SubmitStatus from './V11SubmitStatus';
import {
  getBasicQuestions,
  getTaskQuestions,
  getInterestQuestions,
  submitEvaluation,
} from '../../api/v11';
import { V11_PHASE_LABELS } from './constants';
import type {
  V11BasicQuestion,
  V11TaskQuestion,
  V11InterestQuestion,
  V11SubmitResponse,
} from '@shared/api.interface';

type Phase = 'info' | 'interest' | 'basic' | 'task' | 'submitted';

const PHASE_ORDER: Phase[] = ['info', 'interest', 'basic', 'task', 'submitted'];

const phaseVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface TaskAnswerData {
  main: string;
  extension: string;
}

const AssessmentPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('info');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState({ name: '', candidateId: '', targetRole: '', evaluatorName: '' });
  const [basicQuestions, setBasicQuestions] = useState<V11BasicQuestion[]>([]);
  const [taskQuestions, setTaskQuestions] = useState<V11TaskQuestion[]>([]);
  const [interestQuestions, setInterestQuestions] = useState<V11InterestQuestion[]>([]);
  const [interestAnswers, setInterestAnswers] = useState<Record<string, string>>({});
  const [basicAnswers, setBasicAnswers] = useState<Record<string, string>>({});
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, TaskAnswerData>>({});
  const [submitResult, setSubmitResult] = useState<V11SubmitResponse | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const [bq, tq, iq] = await Promise.all([
        getBasicQuestions(),
        getTaskQuestions(),
        getInterestQuestions(),
      ]);
      setBasicQuestions(bq);
      setTaskQuestions(tq);
      setInterestQuestions(iq);
    } catch (err) {
      logger.error('Failed to load V1.1 questions', err);
      setError('加载题目失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleInfoSubmit = (info: typeof userInfo) => {
    setUserInfo(info);
    setPhase('interest');
  };

  const handleInterestAnswerChange = (questionId: string, answer: string) => {
    setInterestAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleBasicAnswerChange = (questionId: string, answer: string) => {
    setBasicAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id: string) => id !== taskId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, taskId];
    });
  };

  const handleTaskAnswerChange = (taskId: string, field: 'main' | 'extension', value: string) => {
    setTaskAnswers((prev) => ({
      ...prev,
      [taskId]: {
        main: prev[taskId]?.main ?? '',
        extension: prev[taskId]?.extension ?? '',
        [field]: value,
      },
    }));
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const basicAnswersList = Object.entries(basicAnswers)
        .filter(([, answer]: [string, string]) => answer.trim() !== '')
        .map(([questionId, answer]: [string, string]) => ({ questionId, answer }));

      const taskAnswersList = selectedTasks.map((taskId: string) => {
        const taskQ = taskQuestions.find((tq: V11TaskQuestion) => tq.id === taskId);
        const ans = taskAnswers[taskId] ?? { main: '', extension: '' };
        return {
          taskId,
          dimensionCode: taskQ?.dimensionCode ?? '',
          mainAnswer: ans.main,
          extensionAnswer: ans.extension,
        };
      });

      const interestAnswersList = Object.entries(interestAnswers).map(
        ([questionId, answer]: [string, string]) => ({ questionId, answer }),
      );

      const result = await submitEvaluation({
        newcomerName: userInfo.name,
        candidateId: userInfo.candidateId || undefined,
        targetRole: userInfo.targetRole,
        evaluatorName: userInfo.evaluatorName || undefined,
        basicAnswers: basicAnswersList,
        taskAnswers: taskAnswersList,
        interestAnswers: interestAnswersList,
      });

      setSubmitResult(result);
      setPhase('submitted');
    } catch (err) {
      logger.error('Failed to submit V1.1 assessment', err);
      setError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhase('info');
    setUserInfo({ name: '', candidateId: '', targetRole: '', evaluatorName: '' });
    setInterestAnswers({});
    setBasicAnswers({});
    setSelectedTasks([]);
    setTaskAnswers({});
    setSubmitResult(null);
    setError(null);
  };

  const currentPhaseIndex = PHASE_ORDER.indexOf(phase);

  return (
    <div className="muchen-shell relative min-h-[calc(100vh-80px)] px-4 py-8">
      {error && (
        <div className="mx-auto mb-4 max-w-2xl rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
          {error}
        </div>
      )}

      {phase !== 'info' && phase !== 'submitted' && (
        <div className="muchen-glass mx-auto mb-8 flex max-w-3xl items-center justify-center gap-2 rounded-2xl px-5 py-4">
          {PHASE_ORDER.filter((p: Phase) => p !== 'submitted').map((p: Phase, idx: number) => {
            const isActive = p === phase;
            const isDone = idx < currentPhaseIndex;
            return (
              <React.Fragment key={p}>
                {idx > 0 && (
                  <div className={`h-px w-8 ${isDone ? 'bg-gradient-to-r from-[#9b4dff] to-[#00c8ff]' : 'bg-white/12'}`} />
                )}
                <span
                  className={`text-xs ${
                    isActive
                      ? 'font-semibold text-white'
                      : isDone
                        ? 'text-[#8fdcff]'
                        : 'text-white/42'
                  }`}
                >
                  {V11_PHASE_LABELS[p]}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'info' && (
          <motion.div key="info" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
                <p className="text-sm text-white/56">正在加载测评数据...</p>
              </div>
            ) : (
              <V11InfoForm onSubmit={handleInfoSubmit} />
            )}
          </motion.div>
        )}

        {phase === 'interest' && (
          <motion.div key="interest" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <V11InterestSurvey
              questions={interestQuestions}
              answers={interestAnswers}
              onAnswerChange={handleInterestAnswerChange}
              onNext={() => setPhase('basic')}
              onBack={() => setPhase('info')}
            />
          </motion.div>
        )}

        {phase === 'basic' && (
          <motion.div key="basic" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <V11BasicTest
              questions={basicQuestions}
              answers={basicAnswers}
              onAnswerChange={handleBasicAnswerChange}
              onNext={() => setPhase('task')}
              onBack={() => setPhase('interest')}
            />
          </motion.div>
        )}

        {phase === 'task' && (
          <motion.div key="task" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            {submitting ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
                <p className="text-sm text-white/56">正在提交测评...</p>
              </div>
            ) : (
              <V11TaskAssessment
                questions={taskQuestions}
                selectedTasks={selectedTasks}
                taskAnswers={taskAnswers}
                onToggleTask={handleToggleTask}
                onAnswerChange={handleTaskAnswerChange}
                onSubmit={handleSubmitAll}
                onBack={() => setPhase('basic')}
              />
            )}
          </motion.div>
        )}

        {phase === 'submitted' && submitResult && (
          <motion.div key="submitted" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <V11SubmitStatus result={submitResult} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      
        {/*
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <Settings className="h-3 w-3" />
            后台管理
          </Link>
        */}
      
    </div>
  );
};

export default AssessmentPage;
