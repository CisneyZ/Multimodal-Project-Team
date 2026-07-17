import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import type { ChatPhrase } from '@shared/api.interface';
import { getChatPhrases } from '../../api/onboarding';
import { logger } from '@lark-apaas/client-toolkit/logger';

const ChatPhrases: React.FC = () => {
  const [phrases, setPhrases] = useState<ChatPhrase[]>([]);

  useEffect(() => {
    getChatPhrases()
      .then(setPhrases)
      .catch((err) => logger.error('Failed to load chat phrases', err));
  }, []);

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">固定话术配置</h2>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3 w-3" />
          新增话术
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">分类</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">关键词</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">快捷按钮</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">回复内容</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">启用</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase) => (
              <tr key={phrase.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 text-xs font-medium">{phrase.category}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {phrase.keywords.join(', ')}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {phrase.quickButtonTitle ? (
                    <span className="rounded-sm bg-[hsl(213_52%_92%)] px-1.5 py-0.5 text-[hsl(213_52%_35%)]">
                      {phrase.quickButtonTitle}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="max-w-xs truncate px-4 py-2.5 text-xs text-muted-foreground">
                  {phrase.replyContent}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-xs ${phrase.isEnabled ? 'text-[hsl(152_55%_38%)]' : 'text-muted-foreground'}`}>
                    {phrase.isEnabled ? '已启用' : '已禁用'}
                  </span>
                </td>
              </tr>
            ))}
            {phrases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无固定话术配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatPhrases;
