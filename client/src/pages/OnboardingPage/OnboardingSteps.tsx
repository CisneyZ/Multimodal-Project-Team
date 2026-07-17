import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  '基础能力测评',
  '浏览项目背景材料',
  '提醒管理安排下一步',
  '浏览规则文档',
  '完成规则测试',
  '等待管理确认',
];

interface OnboardingStepsProps {
  currentStep: number;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ currentStep }) => {
  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
      {/* Desktop: horizontal with connecting lines */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                )}
                <span
                  className={`text-xs whitespace-nowrap ${
                    isCurrent
                      ? 'font-semibold text-primary'
                      : isCompleted
                        ? 'text-primary opacity-60'
                        : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    index < currentStep ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-3 md:hidden">
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={label} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              ) : (
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
              )}
              <span
                className={`text-sm ${
                  isCurrent
                    ? 'font-semibold text-primary'
                    : isCompleted
                      ? 'text-primary opacity-60'
                      : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingSteps;
