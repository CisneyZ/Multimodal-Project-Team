import React, { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminLoginProps {
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passed = login(username, password);
    if (passed) {
      setError('');
      onSuccess?.();
      return;
    }
    setError('账号或密码不正确，请重新输入');
  };

  return (
    <div className="mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center px-4 py-10">
      <div className="muchen-border-flow muchen-border-flow-active grid w-full overflow-hidden rounded-3xl lg:grid-cols-[1fr_420px]">
        <div className="relative hidden min-h-[460px] overflow-hidden border-r border-white/10 bg-black/24 p-10 lg:block">
          <div className="star-grid absolute inset-0 opacity-50" />
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#7b4dff]/20 blur-[90px]" />
          <div className="absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-[#00c8ff]/14 blur-[96px]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7b4dff]/35 bg-[#7b4dff]/14 text-[#8fdcff]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#65c7ff]">
                Admin Access
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-black leading-tight text-white">
                管理入口需要登录后访问
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/52">
                后台中控与复核舱仅对管理员开放。新人测评页面不会直接展示后台功能。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs text-white/50">
              <span className="rounded-xl border border-white/10 bg-black/24 px-3 py-2">权限校验</span>
              <span className="rounded-xl border border-white/10 bg-black/24 px-3 py-2">数据管理</span>
              <span className="rounded-xl border border-white/10 bg-black/24 px-3 py-2">人工复核</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 sm:p-9">
          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#7b4dff]/35 bg-[#7b4dff]/14 text-[#8fdcff] lg:hidden">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#65c7ff]">
              MPT Platform
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">管理登录</h1>
            <p className="mt-2 text-sm leading-6 text-white/52">
              请输入管理员账号，进入后台中控与复核舱。
            </p>
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold text-white/66">账号</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="muchen-input h-11 w-full rounded-xl px-3 text-sm"
              placeholder="请输入管理账号"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold text-white/66">密码</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="muchen-input h-11 w-full rounded-xl pl-9 pr-3 text-sm"
                placeholder="请输入密码"
              />
            </div>
          </label>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="muchen-primary-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"
          >
            <LogIn className="h-4 w-4" />
            登录管理后台
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
