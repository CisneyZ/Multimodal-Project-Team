import React from 'react';
import type { V11BasicQuestion } from '@shared/api.interface';
import { V11_DIMENSION_LABELS } from './constants';

interface V11BasicTestProps {
  questions: V11BasicQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: '选择题',
  true_false: '判断题',
  short_answer: '简答题',
};

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

interface ParsedOption {
  key: string;
  text: string;
}

const parseOptions = (optionsJson: string | null): ParsedOption[] => {
  if (!optionsJson) return [];
  try {
    return JSON.parse(optionsJson) as ParsedOption[];
  } catch {
    return [];
  }
};

const V11BasicTest: React.FC<V11BasicTestProps> = ({
  questions,
  answers,
  onAnswerChange,
  onNext,
  onBack,
}) => {
  const answeredCount = questions.filter(
    (q: V11BasicQuestion) => answers[q.id] !== undefined && answers[q.id] !== ''
  ).length;

  const requiredQuestions = questions.filter(
    (q: V11BasicQuestion) => q.questionType !== 'short_answer'
  );

  const allRequiredAnswered = requiredQuestions.every(
    (q: V11BasicQuestion) => answers[q.id] !== undefined && answers[q.id] !== ''
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#65c7ff]">Basic Cognition</p>
            <h2 className="text-2xl font-bold text-white">
              基础认知测试
            </h2>
            <p className="mt-2 text-sm text-white/52">共 25 分</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-white/52">
              已答{' '}
              <span className="text-base font-semibold tabular-nums text-white">
                {answeredCount}
              </span>{' '}
              / {questions.length} 题
            </span>
          </div>
        </div>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8b4dff] to-[#00c8ff] transition-all duration-300"
            style={{
              width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question: V11BasicQuestion, index: number) => {
          const dimensionLabel =
            V11_DIMENSION_LABELS[question.dimensionCode] ??
            question.dimensionCode;
          const typeLabel =
            QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType;
          const currentAnswer = answers[question.id] ?? '';
          const options = parseOptions(question.optionsJson);

          return (
            <div
              key={question.id}
              className="muchen-border-flow rounded-2xl p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {index + 1}.
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-[10px] text-white/56">
                  {dimensionLabel}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-[10px] text-white/56">
                  {typeLabel}
                </span>
                <span className="ml-auto text-xs text-white/44">
                  {question.score} 分
                </span>
              </div>

              <p className="mb-5 text-sm leading-7 text-white/88">
                {question.questionText}
              </p>

              {question.questionType === 'single_choice' && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {options.map((option: ParsedOption, optIdx: number) => {
                    const optionKey = OPTION_KEYS[optIdx] ?? option.key;
                    const isSelected = currentAnswer === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => onAnswerChange(question.id, option.key)}
                        className={
                          isSelected
                            ? 'rounded-xl border border-[#7b4dff]/60 bg-gradient-to-r from-[#9546ff]/90 to-[#2385ff]/90 px-4 py-3 text-left text-sm font-medium text-white shadow-[0_12px_28px_rgba(50,112,255,0.22)]'
                            : 'rounded-xl border border-white/12 bg-black/22 px-4 py-3 text-left text-sm text-white/74 transition hover:border-[#4d8dff]/55 hover:bg-white/[0.07] hover:text-white'
                        }
                      >
                        <span className="mr-2 font-medium">{optionKey}.</span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.questionType === 'true_false' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onAnswerChange(question.id, 'true')}
                    className={
                      currentAnswer === 'true'
                        ? 'rounded-xl bg-gradient-to-r from-[#9546ff] to-[#2385ff] px-4 py-2 text-sm font-medium text-white'
                        : 'rounded-xl border border-white/12 bg-black/22 px-4 py-2 text-sm text-white/74 transition hover:border-[#4d8dff]/55 hover:bg-white/[0.07]'
                    }
                  >
                    正确
                  </button>
                  <button
                    type="button"
                    onClick={() => onAnswerChange(question.id, 'false')}
                    className={
                      currentAnswer === 'false'
                        ? 'rounded-xl bg-gradient-to-r from-[#9546ff] to-[#2385ff] px-4 py-2 text-sm font-medium text-white'
                        : 'rounded-xl border border-white/12 bg-black/22 px-4 py-2 text-sm text-white/74 transition hover:border-[#4d8dff]/55 hover:bg-white/[0.07]'
                    }
                  >
                    错误
                  </button>
                </div>
              )}

              {question.questionType === 'short_answer' && (
                <textarea
                  rows={4}
                  value={currentAnswer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onAnswerChange(question.id, e.target.value)
                  }
                  placeholder="请输入你的回答（选填，将由人工评审）"
                  className="muchen-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pb-8">
        <button
          type="button"
          onClick={onBack}
          className="muchen-secondary-btn rounded-lg px-6 py-2 text-sm"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allRequiredAnswered}
          className={
            allRequiredAnswered
              ? 'muchen-primary-btn rounded-lg px-6 py-2 text-sm font-semibold'
              : 'cursor-not-allowed rounded-lg bg-white/12 px-6 py-2 text-sm text-white/38'
          }
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default V11BasicTest;
