import { ExternalLink } from 'lucide-react';
import type { OnboardingMaterial } from '@shared/api.interface';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface MaterialListProps {
  materials: OnboardingMaterial[];
  type: 'project_background' | 'rule_document';
}

const TYPE_LABELS: Record<string, string> = {
  project_background: '项目背景材料',
  rule_document: '规则文档',
};

const MaterialList: React.FC<MaterialListProps> = ({ materials, type }) => {
  const filtered = materials.filter((m) => m.materialType === type);

  if (filtered.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          暂无{TYPE_LABELS[type] || '材料'}，请等待管理端上传。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filtered.map((material) => (
        <div
          key={material.id}
          className="rounded-sm border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-1 font-medium text-foreground">
            {material.title}
          </h3>
          {material.description && (
            <p className="mb-3 text-sm text-muted-foreground">
              {material.description}
            </p>
          )}
          <UniversalLink
            to={material.feishuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm text-primary hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            打开飞书文档
          </UniversalLink>
        </div>
      ))}
    </div>
  );
};

export default MaterialList;
