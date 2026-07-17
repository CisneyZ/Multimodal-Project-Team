import React from 'react';
import type { V11InterestQuestion } from '@shared/api.interface';

interface V11InterestSurveyProps {
  questions: V11InterestQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const V11InterestSurvey: React.FC<V11InterestSurveyProps> = ({
  questions,
  answers,
  onAnswerChange,
  onNext,
  onBack,
}) => {
  const allAnswered = questions.every((q: V11InterestQuestion) => {
    const answer = answers[q.id];
    return answer !== undefined && answer.trim().length >= 20;
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-[#65c7ff]">Interest Mapping</p>
          <h2 className="text-2xl font-bold text-white">
            兴趣与岗位匹配
          </h2>
          <p className="mt-2 text-sm text-white/52">
            共 15 分，共 {questions.length} 题，每题 5 分
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((q: V11InterestQuestion, index: number) => {
            const answer = answers[q.id] ?? '';
            return (
              <div key={q.id} className="rounded-2xl border border-white/10 bg-black/24 p-5">
                <label className="mb-3 block text-sm font-medium leading-6 text-white">
                  {index + 1}. {q.questionText}
                </label>
                <textarea
                  className="muchen-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                  rows={4}
                  value={answer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onAnswerChange(q.id, e.target.value)
                  }
                />
                <div className="mt-1 flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      answer.length >= 20
                        ? 'text-white/46'
                        : 'text-red-300'
                    }`}
                  >
                    至少 20 字
                  </span>
                  <span className="text-xs text-white/46">
                    {answer.length} 字
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="muchen-secondary-btn rounded-lg px-5 py-2 text-sm"
          >
            上一步
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!allAnswered}
            className="muchen-primary-btn rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
};

export default V11InterestSurvey;
