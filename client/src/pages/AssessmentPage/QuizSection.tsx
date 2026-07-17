import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Briefcase, ClipboardCheck, Lightbulb, Star } from 'lucide-react';
import type { QuestionForExam } from '@shared/api.interface';
import { DIMENSION_LABELS } from './constants';

interface QuizSectionProps {
  questions: QuestionForExam[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  userName?: string;
  userPosition?: string;
}

const TYPE_LABELS: Record<string, string> = {
  '单选': '单选题',
  '判断': '判断题',
  '主观': '主观题',
};

const DifficultyStars: React.FC<{ level: string }> = ({ level }) => {
  const n = parseInt(level, 10) || 1;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < n ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  );
};

const QuizSection: React.FC<QuizSectionProps> = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  userName,
  userPosition,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const total = questions.length;
  const current = questions[currentIndex];
  const isLast = currentIndex === total - 1;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== '' && answers[k] !== undefined).length;

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmitClick = () => {
    const unansweredIdx = questions.findIndex((q) => !answers[q.id] || answers[q.id] === '');
    if (unansweredIdx !== -1) {
      setCurrentIndex(unansweredIdx);
      setShowUnansweredWarning(true);
      setTimeout(() => setShowUnansweredWarning(false), 3000);
      return;
    }
    onSubmit();
  };

  const isAnswered = (qId: string): boolean => !!answers[qId] && answers[qId] !== '';
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {showUnansweredWarning && (
        <div className="mb-4 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          存在未作答的题目，请完成所有题目后再提交
        </div>
      )}

      <div className="mb-4 rounded-sm border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {userName && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {userName}
            </span>
          )}
          {userPosition && (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {userPosition}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <ClipboardCheck className="h-3 w-3" />
            已答 {answeredCount}/{total}
          </span>
          <span className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
            AI 预评 + 人工复核
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="shrink-0 text-xs font-medium text-foreground tabular-nums">
            {currentIndex + 1} / {total}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {DIMENSION_LABELS[current.dimensionCode] ?? current.dimensionName}
          </span>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {TYPE_LABELS[current.questionType] ?? current.questionType}
          </span>
          <DifficultyStars level={current.difficulty} />
          <span className="text-xs text-muted-foreground">{current.points} 分</span>
        </div>

        <p className="mb-6 text-sm font-medium leading-relaxed text-foreground">{current.stem}</p>

        {current.questionType === '单选' && current.optionA && (
          <div className="space-y-2.5">
            {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((key, idx) => {
              const opt = current[key];
              if (!opt) return null;
              const label = String.fromCharCode(65 + idx);
              const selected = answers[current.id] === label;
              return (
                <button
                  key={key}
                  onClick={() => onAnswerChange(current.id, label)}
                  className={`w-full rounded-sm border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5 font-medium text-primary'
                      : 'border-border hover:border-primary/30 hover:bg-accent/50'
                  }`}
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                    {label}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {current.questionType === '判断' && (
          <div className="flex gap-3">
            {(['正确', '错误'] as const).map((val) => (
              <button
                key={val}
                onClick={() => onAnswerChange(current.id, val)}
                className={`flex-1 rounded-sm border px-4 py-3 text-center text-sm transition-colors ${
                  answers[current.id] === val
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-border hover:border-primary/30 hover:bg-accent/50'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        )}

        {current.questionType === '主观' && (
          <div>
            <div className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>建议结构化作答：先给出结论，再说明分析过程</span>
            </div>
            <textarea
              value={answers[current.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAnswerChange(current.id, e.target.value)}
              placeholder="请从场景理解、Prompt 拆解、风险判断等角度作答，低置信度答案将进入人工复核..."
              rows={6}
              className="w-full rounded-sm border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              已输入 {(answers[current.id] || '').length} 字
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" disabled={currentIndex === 0} onClick={handlePrev} className="rounded-sm">
          上一题
        </Button>

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
        >
          题目导航
        </button>

        {isLast ? (
          <Button onClick={handleSubmitClick} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90">
            提交答卷
          </Button>
        ) : (
          <Button variant="outline" onClick={handleNext} className="rounded-sm">
            下一题
          </Button>
        )}
      </div>

      {panelOpen && (
        <div className="mt-4 rounded-sm border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-foreground">题目导航</p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-11">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setPanelOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
                  idx === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : isAnswered(q.id)
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
