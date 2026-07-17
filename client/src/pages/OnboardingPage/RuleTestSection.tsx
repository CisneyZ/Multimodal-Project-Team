import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import type {
  OnboardingRuleQuestion,
  SubmitRuleTestResponse,
} from '@shared/api.interface';

interface RuleTestSectionProps {
  questions: OnboardingRuleQuestion[];
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
  result: SubmitRuleTestResponse | null;
  submitting: boolean;
}

const RuleTestSection: React.FC<RuleTestSectionProps> = ({
  questions,
  onSubmit,
  result,
  submitting,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (questionId: string, answer: string) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const answerList = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));
    onSubmit(answerList);
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const passed = result ? result.totalScore >= result.maxScore * 0.6 : false;

  if (questions.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          暂无规则测试题目，请等待管理端配置。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {result && (
        <div className="rounded-sm border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">测试结果</span>
            <span className={`text-lg font-semibold tabular-nums ${passed ? 'text-[hsl(152_55%_38%)]' : 'text-[hsl(0_65%_48%)]'}`}>
              {result.totalScore} / {result.maxScore}
            </span>
          </div>
          <p className={`mt-1 text-sm ${passed ? 'text-[hsl(152_55%_38%)]' : 'text-[hsl(0_65%_48%)]'}`}>
            {passed ? '恭喜通过测试！' : '未通过，请联系管理员。'}
          </p>
        </div>
      )}

      {questions.map((q, index) => {
        const detail = result?.details.find((d) => d.questionId === q.id);
        return (
          <div
            key={q.id}
            className="rounded-sm border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-start gap-2">
              <span className="shrink-0 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-foreground">
                {q.questionText}
              </p>
            </div>

            {q.questionType === 'single_choice' && (
              <div className="flex flex-col gap-2">
                {q.options?.map((opt) => {
                  const isSelected = answers[q.id] === opt.label;
                  const isCorrectAnswer = result && detail?.isCorrect && answers[q.id] === opt.label;
                  const isWrong = result && isSelected && !detail?.isCorrect;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelect(q.id, opt.label)}
                      disabled={!!result}
                      className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                        isCorrectAnswer
                          ? 'border-[hsl(152_55%_38%)] bg-[hsl(152_55%_38%)]/5'
                          : isWrong
                            ? 'border-[hsl(0_65%_48%)] bg-[hsl(0_65%_48%)]/5'
                            : isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent'
                      } ${result ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="shrink-0 font-medium text-muted-foreground">
                        {opt.label}.
                      </span>
                      <span className="text-foreground">{opt.text}</span>
                      {result && isCorrectAnswer && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-[hsl(152_55%_38%)]" />
                      )}
                      {result && isWrong && (
                        <Circle className="ml-auto h-4 w-4 text-[hsl(0_65%_48%)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {q.questionType === 'true_false' && (
              <div className="flex gap-3">
                {['正确', '错误'].map((label) => {
                  const isCorrect = result && q.correctAnswer === label;
                  const isSelected = answers[q.id] === label;
                  const isWrong = result && isSelected && q.correctAnswer !== label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSelect(q.id, label)}
                      disabled={!!result}
                      className={`flex-1 rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                        isCorrect
                          ? 'border-[hsl(152_55%_38%)] bg-[hsl(152_55%_38%)]/5 text-[hsl(152_55%_38%)]'
                          : isWrong
                            ? 'border-[hsl(0_65%_48%)] bg-[hsl(0_65%_48%)]/5 text-[hsl(0_65%_48%)]'
                            : isSelected
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-foreground hover:bg-accent'
                      } ${result ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {result && detail && (
              <div className="mt-3 rounded-sm bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">解析：</span>
                  {q.explanation || '暂无解析'}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {!result && (
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交测试'}
        </Button>
      )}
    </div>
  );
};

export default RuleTestSection;
