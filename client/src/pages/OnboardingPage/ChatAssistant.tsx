import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { OnboardingProgressItem, ChatBootstrapResponse } from '@shared/api.interface';
import { getChatBootstrap, sendChatMessage, remindAdmin } from '../../api/onboarding';

interface ChatAssistantProps {
  progress: OnboardingProgressItem | null;
}

interface DisplayMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ progress }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [bootstrap, setBootstrap] = useState<ChatBootstrapResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!open) return;
    getChatBootstrap(progress?.id)
      .then((data) => {
        setBootstrap(data);
        if (prevStatusRef.current !== progress?.status) {
          prevStatusRef.current = progress?.status ?? null;
          setMessages([{ id: `welcome-${Date.now()}`, role: 'bot', content: data.welcomeMessage }]);
        }
      })
      .catch((err: unknown) => {
        logger.error('Failed to load chat bootstrap', err);
      });
  }, [open, progress?.status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: 'bot', content: text }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}-u`, role: 'user', content: text }]);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    addUserMessage(text.trim());
    setInput('');
    setSending(true);
    try {
      const res = await sendChatMessage({ progressId: progress?.id, message: text.trim() });
      addBotMessage(res.reply);
    } catch {
      addBotMessage('抱歉，暂时无法处理你的请求，请稍后再试。');
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = async (action: string, title: string) => {
    if (action === 'p-2') {
      if (!progress?.id) {
        addBotMessage('请先开始引导流程后再使用此功能。');
        return;
      }
      addUserMessage(title);
      setSending(true);
      try {
        const res = await remindAdmin({ progressId: progress.id });
        addBotMessage(res.message);
      } catch {
        addBotMessage('提醒发送失败，请稍后重试。');
      } finally {
        setSending(false);
      }
      return;
    }
    await handleSend(title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          aria-label="打开引导助手"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[70vh] max-h-[520px] w-[calc(100vw-2rem)] max-w-[380px] flex-col rounded-sm border border-border bg-card shadow-lg sm:bottom-6 sm:right-6">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">引导助手</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-sm px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                    思考中...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {bootstrap && bootstrap.quickButtons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
              {bootstrap.quickButtons.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleQuickAction(btn.action, btn.title)}
                  disabled={sending}
                  className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  {btn.title}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              aria-label="发送"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
