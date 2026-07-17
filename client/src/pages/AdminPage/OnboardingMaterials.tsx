import React, { useState } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { createMaterial, updateMaterial } from '../../api/onboarding';
import type { OnboardingMaterial, MaterialType } from '@shared/api.interface';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface OnboardingMaterialsProps {
  materials: OnboardingMaterial[];
  onRefresh: () => void;
}

interface MaterialForm {
  title: string;
  materialType: MaterialType;
  feishuUrl: string;
  description: string;
  sortOrder: number;
  isEnabled: boolean;
}

const EMPTY_FORM: MaterialForm = {
  title: '',
  materialType: 'project_background',
  feishuUrl: '',
  description: '',
  sortOrder: 0,
  isEnabled: true,
};

const TYPE_LABELS: Record<MaterialType, string> = {
  project_background: '项目背景',
  rule_document: '规则文档',
};

const OnboardingMaterials: React.FC<OnboardingMaterialsProps> = ({ materials, onRefresh }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: materials.length + 1 });
    setShowDialog(true);
  };

  const openEdit = (m: OnboardingMaterial) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      materialType: m.materialType,
      feishuUrl: m.feishuUrl,
      description: m.description ?? '',
      sortOrder: m.sortOrder,
      isEnabled: m.isEnabled,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.feishuUrl) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        materialType: form.materialType,
        feishuUrl: form.feishuUrl,
        description: form.description || undefined,
        sortOrder: form.sortOrder,
        isEnabled: form.isEnabled,
      };
      if (editingId) {
        await updateMaterial(editingId, payload);
      } else {
        await createMaterial(payload);
      }
      setShowDialog(false);
      onRefresh();
    } catch {
      // error handled by API layer
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof MaterialForm>(key: K, value: MaterialForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">引导材料</h2>
          <p className="mt-1 text-xs text-muted-foreground">共 {materials.length} 份材料</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3 w-3" />
          新增材料
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">标题</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">类型</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">飞书链接</th>
              <th className="max-w-xs px-4 py-2.5 text-left font-medium text-muted-foreground">描述</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">启用</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">排序</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 text-xs font-medium">{m.title}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-sm px-1.5 py-0.5 text-xs ${
                    m.materialType === 'project_background'
                      ? 'bg-[hsl(213_52%_92%)] text-[hsl(213_52%_35%)]'
                      : 'bg-[hsl(33_85%_92%)] text-[hsl(33_85%_35%)]'
                  }`}>
                    {TYPE_LABELS[m.materialType]}
                  </span>
                </td>
                <td className="max-w-[200px] truncate px-4 py-2.5 text-xs text-muted-foreground">
                  {m.feishuUrl ? (
                    <UniversalLink to={m.feishuUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
                      {m.feishuUrl}
                    </UniversalLink>
                  ) : '-'}
                </td>
                <td className="max-w-xs truncate px-4 py-2.5 text-xs text-muted-foreground">{m.description ?? '-'}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${m.isEnabled ? 'bg-[hsl(152_55%_38%)]' : 'bg-muted-foreground'}`} />
                </td>
                <td className="px-4 py-2.5 text-center tabular-nums text-xs">{m.sortOrder}</td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => openEdit(m)}
                    className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <Edit3 className="h-3 w-3" />
                    编辑
                  </button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无引导材料
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
                {editingId ? '编辑材料' : '新增材料'}
              </h3>
              <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">
                标题
                <input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
              </label>
              <label className="block text-xs text-muted-foreground">
                类型
                <select value={form.materialType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('materialType', e.target.value as MaterialType)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                  <option value="project_background">项目背景</option>
                  <option value="rule_document">规则文档</option>
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                飞书链接
                <input value={form.feishuUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('feishuUrl', e.target.value)}
                  placeholder="https://xxx.feishu.cn/..." className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
              </label>
              <label className="block text-xs text-muted-foreground">
                描述
                <textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('description', e.target.value)} rows={2}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground" />
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

export default OnboardingMaterials;
