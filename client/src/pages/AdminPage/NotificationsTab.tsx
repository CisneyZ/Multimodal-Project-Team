import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import type { NotificationItem } from '@shared/api.interface';

function typeLabel(type: string): string {
  switch (type) {
    case 'submission_completed': return '测评提交';
    case 'review_needed': return '需要复核';
    case 'review_completed': return '复核完成';
    default: return type;
  }
}

function typeIcon(type: string) {
  switch (type) {
    case 'submission_completed': return <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(152_55%_38%)]" />;
    case 'review_needed': return <AlertTriangle className="h-3.5 w-3.5 text-[hsl(33_85%_48%)]" />;
    case 'review_completed': return <Send className="h-3.5 w-3.5 text-[hsl(213_52%_42%)]" />;
    default: return <Bell className="h-3.5 w-3.5" />;
  }
}

const NotificationsTab: React.FC<{ notifications: NotificationItem[] }> = ({ notifications }) => (
  <div className="rounded-sm border border-border bg-card shadow-sm">
    <div className="border-b border-border px-6 py-4">
      <h2 className="text-sm font-semibold text-foreground">通知中心</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        共 {notifications.length} 条通知，当前模式：dry-run（未实际发送）
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">类型</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">接收角色</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">标题</th>
            <th className="max-w-xs px-4 py-2.5 text-left font-medium text-muted-foreground">内容</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">状态</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">时间</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1 text-xs">
                  {typeIcon(n.type)}
                  {typeLabel(n.type)}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs">{n.targetRole}</span>
              </td>
              <td className="px-4 py-2.5 text-xs font-medium">{n.title}</td>
              <td className="max-w-xs truncate px-4 py-2.5 text-xs text-muted-foreground">{n.content}</td>
              <td className="px-4 py-2.5">
                <span className="rounded-sm bg-[hsl(33_85%_92%)] px-1.5 py-0.5 text-xs text-[hsl(33_85%_35%)]">
                  {n.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {n.createdAt ? new Date(n.createdAt).toLocaleString('zh-CN') : '-'}
              </td>
            </tr>
          ))}
          {notifications.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                暂无通知记录
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default NotificationsTab;
