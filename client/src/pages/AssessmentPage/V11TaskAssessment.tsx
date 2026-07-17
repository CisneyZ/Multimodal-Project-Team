import React from 'react';
import type { V11TaskQuestion } from '@shared/api.interface';
import {
  V11_DIMENSION_LABELS,
  V11_RUBRIC_LABELS,
  V11_RUBRIC_MAX,
} from './constants';

interface TaskAnswerData {
  main: string;
  extension: string;
}

interface V11TaskAssessmentProps {
  questions: V11TaskQuestion[];
  selectedTasks: string[];
  taskAnswers: Record<string, TaskAnswerData>;
  onToggleTask: (taskId: string) => void;
  onAnswerChange: (
    taskId: string,
    field: 'main' | 'extension',
    value: string,
  ) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const RubricTags: React.FC = () => {
  const keys = Object.keys(V11_RUBRIC_LABELS);
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((key: string) => (
        <span
          key={key}
          className="inline-block rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-xs text-white/54"
        >
          {V11_RUBRIC_LABELS[key]} {V11_RUBRIC_MAX[key]}分
        </span>
      ))}
    </div>
  );
};

const V11TaskAssessment: React.FC<V11TaskAssessmentProps> = ({
  questions,
  selectedTasks,
  taskAnswers,
  onToggleTask,
  onAnswerChange,
  onSubmit,
  onBack,
}) => {
  const canSelectMore = selectedTasks.length < 3;

  const hasEmptyMain = selectedTasks.some(
    (id: string) => !taskAnswers[id]?.main?.trim(),
  );

  const isSubmitDisabled = selectedTasks.length !== 3 || hasEmptyMain;

  const handleToggle = (taskId: string): void => {
    if (!selectedTasks.includes(taskId) && !canSelectMore) return;
    onToggleTask(taskId);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="muchen-border-flow muchen-border-flow-active rounded-2xl p-6">
        <p className="mb-2 text-sm font-semibold text-[#65c7ff]">Task Assessment</p>
        <h2 className="text-2xl font-bold text-white">
          任务型测评
        </h2>
        <p className="mt-2 text-sm text-white/52">
          共 60 分，从 5 个任务中选择 3 个作答
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q: V11TaskQuestion) => {
          const isSelected = selectedTasks.includes(q.id);
          const answer = taskAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`muchen-border-flow rounded-2xl p-6 transition-all ${
                isSelected
                  ? 'muchen-border-flow-active'
                  : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block rounded-full border border-[#7b4dff]/30 bg-[#7b4dff]/12 px-3 py-1 text-xs font-medium text-[#8fdcff]">
                      {V11_DIMENSION_LABELS[q.dimensionCode] ?? q.dimensionCode}
                    </span>
                    <span className="text-xs text-white/44">
                      满分 {q.scoreTotal} 分
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {q.title}
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-[#65c7ff]">
                        情境描述
                      </p>
                      <p className="text-sm leading-7 text-white/76">
                        {q.scenario}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-[#65c7ff]">
                        主任务
                      </p>
                      <p className="text-sm leading-7 text-white/76">
                        {q.mainTask}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-[#65c7ff]">
                        延展问题
                      </p>
                      <p className="text-sm leading-7 text-white/76">
                        {q.extensionQuestion}
                      </p>
                    </div>
                  </div>

                  <RubricTags />
                </div>

                <label className="flex cursor-pointer items-center gap-2 shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(q.id)}
                    className="h-4 w-4 rounded border-white/20 bg-black text-[#8b5cf6] accent-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
                  />
                  <span className="whitespace-nowrap text-xs text-white/54">
                    {isSelected ? '已选择' : canSelectMore ? '选择' : '已满'}
                  </span>
                </label>
              </div>

              {isSelected && (
                <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-white">
                      主任务作答
                    </label>
                    <textarea
                      rows={6}
                      value={answer?.main ?? ''}
                      onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>,
                      ) => onAnswerChange(q.id, 'main', e.target.value)}
                      placeholder="请在此作答主任务内容..."
                      className="muchen-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-white">
                      延展问题作答
                    </label>
                    <textarea
                      rows={4}
                      value={answer?.extension ?? ''}
                      onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>,
                      ) =>
                        onAnswerChange(q.id, 'extension', e.target.value)
                      }
                      placeholder="请在此作答延展问题..."
                      className="muchen-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="muchen-secondary-btn rounded-lg px-5 py-2 text-sm"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="muchen-primary-btn rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50"
        >
          提交测评
        </button>
      </div>
    </div>
  );
};

export default V11TaskAssessment;
