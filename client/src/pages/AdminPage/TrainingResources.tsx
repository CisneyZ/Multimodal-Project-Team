import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  BookOpen,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { V11TrainingResource } from '@shared/api.interface';
import {
  getV11TrainingResources,
  createV11TrainingResource,
  updateV11TrainingResource,
  deleteV11TrainingResource,
} from '../../api/v11';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

const RESOURCE_TYPE_OPTIONS = [
  { value: 'project_background', label: '项目背景材料' },
  { value: 'rule_document', label: '规范文档' },
  { value: 'training_material', label: '培训材料' },
];

const DIMENSION_OPTIONS = [
  { value: 'film_theory', label: '影视基础理论' },
  { value: 'visual_language', label: '视听语言应用' },
  { value: 'script_narrative', label: '剧本叙事拆解' },
  { value: 'aigc_business', label: 'AIGC 业务认知' },
  { value: 'analysis', label: '综合分析与项目反馈能力' },
];

const MONTH_OPTIONS = [
  { value: 1, label: '第 1 天' },
  { value: 2, label: '第 2 天' },
  { value: 3, label: '第 3 天' },
  { value: 4, label: '第 4 天' },
  { value: 5, label: '第 5 天' },
  { value: 6, label: '第 6 天' },
  { value: 7, label: '第 7 天' },
];

type ResourceFormState = {
  title: string;
  resourceType: string;
  dimensionCode: string;
  url: string;
  description: string;
  monthStage: 1 | 2 | 3;
  isEnabled: boolean;
};

const EMPTY_FORM: ResourceFormState = {
  title: '',
  resourceType: 'training_material',
  dimensionCode: 'film_theory',
  url: '',
  description: '',
  monthStage: 1,
  isEnabled: true,
};

const TrainingResources: React.FC = () => {
  const [resources, setResources] = useState<V11TrainingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceFormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      const data = await getV11TrainingResources();
      setResources(data);
    } catch (err) {
      logger.error('加载培训材料失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openCreateForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (resource: V11TrainingResource) => {
    setForm({
      title: resource.title,
      resourceType: resource.resourceType,
      dimensionCode: resource.dimensionCode,
      url: resource.url ?? '',
      description: resource.description,
      monthStage: resource.monthStage,
      isEnabled: resource.isEnabled,
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateV11TrainingResource(editingId, {
          ...form,
          url: form.url || null,
        });
      } else {
        await createV11TrainingResource({
          ...form,
          url: form.url || null,
          sortOrder: resources.length + 1,
        });
      }
      await fetchResources();
      closeForm();
    } catch (err) {
      logger.error('保存培训材料失败', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteV11TrainingResource(id);
      setResources((prev) => prev.filter((r: V11TrainingResource) => r.id !== id));
    } catch (err) {
      logger.error('删除培训材料失败', err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEnabled = async (resource: V11TrainingResource) => {
    try {
      await updateV11TrainingResource(resource.id, { isEnabled: !resource.isEnabled });
      setResources((prev) =>
        prev.map((r: V11TrainingResource) =>
          r.id === resource.id ? { ...r, isEnabled: !r.isEnabled } : r,
        ),
      );
    } catch (err) {
      logger.error('切换启用状态失败', err);
    }
  };

  const getTypeLabel = (type: string): string => {
    return RESOURCE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  };

  const getDimLabel = (code: string): string => {
    return DIMENSION_OPTIONS.find((o) => o.value === code)?.label ?? code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">培训材料管理</h2>
          <span className="text-xs text-muted-foreground">({resources.length} 条)</span>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          新增材料
        </button>
      </div>

      {/* 列表 */}
      {resources.length === 0 ? (
        <div className="rounded-sm border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          暂无培训材料，点击「新增材料」添加
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">标题</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">类型</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">方向</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">阶段</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r: V11TrainingResource) => (
                <tr key={r.id} className="border-b border-border/50 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{r.title}</div>
                    {r.url && (
                      <UniversalLink
                        to={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        查看文档
                      </UniversalLink>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{getTypeLabel(r.resourceType)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{getDimLabel(r.dimensionCode)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">第 {r.monthStage} 月</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => toggleEnabled(r)}
                      className={`rounded-sm px-2 py-0.5 text-[10px] font-medium ${
                        r.isEnabled
                          ? 'bg-[hsl(152_55%_94%)] text-[hsl(152_55%_30%)]'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {r.isEnabled ? '已启用' : '已停用'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditForm(r)}
                        className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-[hsl(0_65%_96%)] hover:text-[hsl(0_65%_48%)] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-sm border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">
                {editingId ? '编辑材料' : '新增材料'}
              </h3>
              <button
                onClick={closeForm}
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  材料标题 <span className="text-[hsl(0_65%_48%)]">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入材料标题"
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    材料类型
                  </label>
                  <select
                    value={form.resourceType}
                    onChange={(e) => setForm({ ...form, resourceType: e.target.value })}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {RESOURCE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    所属方向
                  </label>
                  <select
                    value={form.dimensionCode}
                    onChange={(e) => setForm({ ...form, dimensionCode: e.target.value })}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {DIMENSION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    培养阶段
                  </label>
                  <select
                    value={form.monthStage}
                    onChange={(e) =>
                      setForm({ ...form, monthStage: Number(e.target.value) as 1 | 2 | 3 })
                    }
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {MONTH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                      className="h-3.5 w-3.5 rounded-sm border-border"
                    />
                    启用
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  飞书文档 URL
                </label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://your-domain.feishu.cn/docx/..."
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  说明
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="材料说明"
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button
                onClick={closeForm}
                className="rounded-sm border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingResources;
