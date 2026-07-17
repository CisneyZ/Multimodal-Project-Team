import React, { useCallback, useMemo, useState } from 'react';
import { Bell, BookOpen, HelpCircle, MessageSquare, Users } from 'lucide-react';
import type { OnboardingMaterial, OnboardingRuleQuestion, OnboardingProgressItem } from '@shared/api.interface';
import OnboardingMaterials from './OnboardingMaterials';
import OnboardingQuestions from './OnboardingQuestions';
import OnboardingProgress from './OnboardingProgress';
import ChatFlows from './ChatFlows';
import ChatPhrases from './ChatPhrases';
import OnboardingTodos from './OnboardingTodos';
import * as onboardingApi from '../../api/onboarding';

interface OnboardingTabProps {
  materials: OnboardingMaterial[];
  ruleQuestions: OnboardingRuleQuestion[];
  progressList: OnboardingProgressItem[];
  onRefresh: () => void;
}

type Section = 'todos' | 'materials' | 'questions' | 'progress' | 'chat-flows' | 'chat-phrases';

const SECTION_LABELS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'todos', label: '待办提醒', icon: <Bell className="h-3.5 w-3.5" /> },
  { key: 'materials', label: '引导材料', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: 'questions', label: '规则题目', icon: <HelpCircle className="h-3.5 w-3.5" /> },
  { key: 'progress', label: '新人进度', icon: <Users className="h-3.5 w-3.5" /> },
  { key: 'chat-flows', label: '聊天流程', icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { key: 'chat-phrases', label: '固定话术', icon: <MessageSquare className="h-3.5 w-3.5" /> },
];

const OnboardingTab: React.FC<OnboardingTabProps> = ({ materials, ruleQuestions, progressList, onRefresh }) => {
  const [activeSection, setActiveSection] = useState<Section>('todos');

  const pendingList = useMemo(
    () => progressList.filter((p) => p.status === 'background_done'),
    [progressList],
  );

  const handleAdvanceRules = useCallback(async (progressId: string) => {
    await onboardingApi.advanceToRules(progressId);
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-sm border border-border bg-muted/30 p-1">
        {SECTION_LABELS.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs transition-colors ${
              activeSection === sec.key
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {sec.icon}
            {sec.label}
            {sec.key === 'todos' && pendingList.length > 0 && (
              <span className="rounded-full bg-[hsl(0_65%_48%)] px-1.5 py-0 text-[10px] text-white">
                {pendingList.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeSection === 'todos' && (
        <OnboardingTodos pendingList={pendingList} onAdvanceRules={handleAdvanceRules} />
      )}
      {activeSection === 'materials' && (
        <OnboardingMaterials materials={materials} onRefresh={onRefresh} />
      )}
      {activeSection === 'questions' && (
        <OnboardingQuestions questions={ruleQuestions} onRefresh={onRefresh} />
      )}
      {activeSection === 'progress' && (
        <OnboardingProgress progressList={progressList} onRefresh={onRefresh} onAdvanceRules={handleAdvanceRules} />
      )}
      {activeSection === 'chat-flows' && <ChatFlows />}
      {activeSection === 'chat-phrases' && <ChatPhrases />}
    </div>
  );
};

export default OnboardingTab;
