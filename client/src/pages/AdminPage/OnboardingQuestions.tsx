import React, { useState } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { createRuleQuestion, updateRuleQuestion } from '../../api/onboarding';
import type { OnboardingRuleQuestion, RuleQuestionType, RuleQuestionOption } from '@shared/api.interface';

interface OnboardingQuestionsProps {
  questions: OnboardingRuleQuestion[];
  onRefresh: () => void;
}

interface QuestionForm {
  questionType: RuleQuestionType;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  score: number;
  sortOrder: number;
  isEnabled: boolean;
}

const EMPTY_FORM: QuestionForm = {
  questionType: 'single_choice',
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
  explanation: '',
  score: 10,
  sortOrder: 0,
  isEnabled: true,
};

const TYPE_LABELS: Record<RuleQuestionType, string> = {
  single_choice: '单选',
  true_false: '判断',
};

const OnboardingQuestions: React.FC<OnboardingQuestionsProps> = ({ questions, onRefresh }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: questions.length + 1 });
    setShowDialog(true);
  };

  const openEdit = (q: OnboardingRuleQuestion) => {
    setEditingId(q.id);
    const opts = q.options ?? [];
    setForm({
      questionType: q.questionType,
      questionText: q.questionText,
      optionA: opts.find((o: RuleQuestionOption) => o.label === 'A')?.text ?? '',
      optionB: opts.find((o: RuleQuestionOption) => o.label === 'B')?.text ?? '',
      optionC: opts.find((o: RuleQuestionOption) => o.label === 'C')?.text ?? '',
      optionD: opts.find((o: RuleQuestionOption) => o.label === 'D')?.text ?? '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
      score: q.score,
      sortOrder: q.sortOrder,
      isEnabled: q.isEnabled,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.questionText || !form.correctAnswer) return;
    setSaving(true);
    try {
      const options: RuleQuestionOption[] | undefined = form.questionType === 'single_choice'
        ? [
            { label: 'A', text: form.optionA },
            { label: 'B', text: form.optionB },
            { label: 'C', text: form.optionC },
            { label: 'D', text: form.optionD },
          ]
        : undefined;
      const payload = {
        questionText: form.questionText,
        questionType: form.questionType,
        options,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation || undefined,
        score: form.score,
        sortOrder: form.sortOrder,
        isEnabled: form.isEnabled,
      };
      if (editingId) {
        await updateRuleQuestion(editingId, payload);
      } else {
        await createRuleQuestion(payload);
      }
      setShowDialog(false);
      onRefresh();
    } catch {
      // error handled by API layer
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof QuestionForm>(key: K, value: QuestionForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">规则测试题目</h2>
          <p className="mt-1 text-xs text-muted-foreground">共 {questions.length} 道题目</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3 w-3" />
          新增题目
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="max-w-xs px-4 py-2.5 text-left font-medium text-muted-foreground">题目</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">题型</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">正确答案</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">分值</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">启用</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">排序</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-border/50 last:border-0">
                <td className="max-w-xs truncate px-4 py-2.5 text-xs">{q.questionText}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs">{TYPE_LABELS[q.questionType]}</span>
                </td>
                <td className="px-4 py-2.5 text-xs font-medium">{q.correctAnswer}</td>
                <td className="px-4 py-2.5 text-center tabular-nums text-xs">{q.score}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${q.isEnabled ? 'bg-[hsl(152_55%_38%)]' : 'bg-muted-foreground'}`} />
                </td>
                <td className="px-4 py-2.5 text-center tabular-nums text-xs">{q.sortOrder}</td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => openEdit(q)}
                    className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <Edit3 className="h-3 w-3" />
                    编辑
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无规则测试题目
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-sm border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {editingId ? '编辑题目' : '新增题目'}
              </h3>
              <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-muted-foreground">
                  题型
                  <select value={form.questionType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('questionType', e.target.value as RuleQuestionType)}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                    <option value="single_choice">单选</option>
                    <option value="true_false">判断</option>
                  </select>
                </label>
                <label className="block text-xs text-muted-foreground">
                  分值
                  <input type="number" value={form.score} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('score', Number(e.target.value))}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                </label>
              </div>
              <label className="block text-xs text-muted-foreground">
                题目内容
                <textarea value={form.questionText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('questionText', e.target.value)} rows={2}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </label>
              {form.questionType === 'single_choice' && (
                <div className="grid grid-cols-2 gap-2">
                  {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((key, i) => (
                    <label key={key} className="block text-xs text-muted-foreground">
                      {String.fromCharCode(65 + i)} 选项
                      <input value={form[key]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(key, e.target.value)}
                        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                    </label>
                  ))}
                </div>
              )}
              <label className="block text-xs text-muted-foreground">
                正确答案
                <input value={form.correctAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('correctAnswer', e.target.value)}
                  placeholder={form.questionType === 'single_choice' ? 'A / B / C / D' : '正确 / 错误'}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
              </label>
              <label className="block text-xs text-muted-foreground">
                解析说明
                <input value={form.explanation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('explanation', e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-muted-foreground">
                  排序
                  <input type="number" value={form.sortOrder} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('sortOrder', Number(e.target.value))}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                </label>
                <label className="flex items-end gap-2 pb-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" checked={form.isEnabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('isEnabled', e.target.checked)}
                    className="h-4 w-4 rounded-sm border-border" />
                  启用
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDialog(false)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent">
                取消
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-sm bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingQuestions;
