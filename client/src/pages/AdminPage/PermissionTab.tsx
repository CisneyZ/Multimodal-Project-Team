import React from 'react';
import { Shield, Users, Eye, Edit3 } from 'lucide-react';
import type { DemoRole } from '../../hooks/useDemoRole';

const ROLES = [
  {
    key: 'admin' as DemoRole,
    label: '管理员 (Admin)',
    icon: <Shield className="h-4 w-4" />,
    permissions: ['题库管理（新增/编辑/启停）', '评分规则查看', '培训资源查看', '测评记录及详情', '人工复核概览', '通知中心', '智能体设置', '权限管理'],
    color: 'text-[hsl(213_52%_42%)]',
  },
  {
    key: 'reviewer' as DemoRole,
    label: '复核专家 (Reviewer)',
    icon: <Edit3 className="h-4 w-4" />,
    permissions: ['人工复核页面', '复核题目评分', '查看测评记录'],
    color: 'text-[hsl(33_85%_48%)]',
  },
  {
    key: 'newcomer' as DemoRole,
    label: '新人 (Newcomer)',
    icon: <Eye className="h-4 w-4" />,
    permissions: ['参加能力测评', '查看测评结果报告'],
    color: 'text-[hsl(152_55%_38%)]',
  },
];

const PermissionTab: React.FC<{
  currentRole: DemoRole;
  onSwitchRole: (r: DemoRole) => void;
}> = ({ currentRole, onSwitchRole }) => (
  <div className="space-y-4">
    <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">角色权限说明</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        当前为演示模式，通过 URL 参数 ?role= 切换角色。生产环境将接入企业权限系统。
      </p>

      <div className="space-y-4">
        {ROLES.map((r) => (
          <div
            key={r.key}
            className={`rounded-sm border p-4 transition-colors ${
              currentRole === r.key ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 text-sm font-medium ${r.color}`}>
                {r.icon}
                {r.label}
              </span>
              {currentRole === r.key ? (
                <span className="rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  当前角色
                </span>
              ) : (
                <button
                  onClick={() => onSwitchRole(r.key)}
                  className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
                >
                  切换到此角色
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.permissions.map((p) => (
                <span key={p} className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PermissionTab;
