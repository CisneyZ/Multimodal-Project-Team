import React, { useState } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { createAdminQuestion, updateAdminQuestion, getAdminQuestions } from '../../api/assessment';
import type { QuestionItem, QuestionType, Difficulty } from '@shared/api.interface';

interface QuestionForm {
  questionNumber: number;
  dimensionId: string;
  questionType: QuestionType;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  scoringKeywords: string;
  points: number;
  difficulty: Difficulty;
}

const EMPTY_FORM: QuestionForm = {
  questionNumber: 0, dimensionId: '', questionType: '单选', stem: '',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: '', scoringKeywords: '', points: 10, difficulty: '2',
};

const DIMENSIONS = [
  { id: '', label: '请选择维度' },
];

const QuestionTab: React.FC<{
  questions: QuestionItem[];
  onToggle: (id: string, enabled: boolean) => void;
  onRefresh: () => void;
}> = ({ questions, onToggle, onRefresh }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const dimMap = new Map<string, { id: string; label: string }>();
  questions.forEach((q) => dimMap.set(q.dimensionId, { id: q.dimensionId, label: q.dimensionName }));
  const dimensions = [{ id: '', label: '请选择维度' }, ...dimMap.values()];

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, questionNumber: questions.length + 1 });
    setShowDialog(true);
  };

  const openEdit = (q: QuestionItem) => {
    setEditingId(q.id);
    setForm({
      questionNumber: q.questionNumber,
      dimensionId: q.dimensionId,
      questionType: q.questionType,
      stem: q.stem,
      optionA: q.optionA ?? '',
      optionB: q.optionB ?? '',
      optionC: q.optionC ?? '',
      optionD: q.optionD ?? '',
      correctAnswer: q.correctAnswer ?? '',
      scoringKeywords: q.scoringKeywords ?? '',
      points: q.points,
      difficulty: q.difficulty,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.stem || !form.dimensionId || !form.questionNumber) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminQuestion(editingId, form);
      } else {
        await createAdminQuestion(form);
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
          <h2 className="text-sm font-semibold text-foreground">题库列表</h2>
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
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">编号</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">题型</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">维度</th>
              <th className="max-w-xs px-4 py-2.5 text-left font-medium text-muted-foreground">题干</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">分值</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">难度</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">启用</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 tabular-nums">{q.questionNumber}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs">{q.questionType}</span>
                </td>
                <td className="px-4 py-2.5 text-xs">{q.dimensionName}</td>
                <td className="max-w-xs truncate px-4 py-2.5 text-xs text-muted-foreground">{q.stem}</td>
                <td className="px-4 py-2.5 tabular-nums">{q.points}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{'★'.repeat(Number(q.difficulty))}</span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => onToggle(q.id, q.isEnabled)}
                    className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      q.isEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        q.isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>
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
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-xs text-muted-foreground">
                  题号
                  <input type="number" value={form.questionNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('questionNumber', Number(e.target.value))}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                </label>
                <label className="block text-xs text-muted-foreground">
                  题型
                  <select value={form.questionType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('questionType', e.target.value as QuestionType)}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                    <option value="单选">单选</option>
                    <option value="判断">判断</option>
                    <option value="主观">主观</option>
                  </select>
                </label>
                <label className="block text-xs text-muted-foreground">
                  分值
                  <input type="number" value={form.points} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('points', Number(e.target.value))}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                </label>
              </div>
              <label className="block text-xs text-muted-foreground">
                所属维度
                <select value={form.dimensionId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('dimensionId', e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                  {dimensions.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                难度
                <select value={form.difficulty} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('difficulty', e.target.value as Difficulty)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                  {['1', '2', '3', '4', '5'].map((d) => <option key={d} value={d}>{'★'.repeat(Number(d))}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                题干
                <textarea value={form.stem} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('stem', e.target.value)} rows={3}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </label>
              {form.questionType !== '主观' && (
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
              {form.questionType !== '主观' && (
                <label className="block text-xs text-muted-foreground">
                  正确答案
                  <input value={form.correctAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('correctAnswer', e.target.value)}
                    placeholder="如: A" className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
                </label>
              )}
              {form.questionType === '主观' && (
                <label className="block text-xs text-muted-foreground">
                  评分关键词（逗号分隔）
                  <textarea value={form.scoringKeywords} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('scoringKeywords', e.target.value)} rows={2}
                    placeholder="关键词1,关键词2,关键词3" className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground" />
                </label>
              )}
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

export default QuestionTab;
