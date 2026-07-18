import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  Compass,
  Database,
  Globe2,
  LogIn,
  LogOut,
  Route,
  Search,
  User,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

const publicNavItems = [
  {
    label: '测评首页',
    subtitle: '新人五维测评',
    href: '/',
    match: (pathname: string) => pathname === '/',
    icon: Compass,
  },
  {
    label: '项目引导',
    subtitle: '新人学习路径',
    href: '/onboarding',
    match: (pathname: string) => pathname.startsWith('/onboarding'),
    icon: Route,
  },
];

const adminNavItems = [
  {
    label: '后台中控',
    subtitle: '评分与数据',
    href: '/admin',
    match: (pathname: string, search = '') => pathname.startsWith('/admin') && !search.includes('tab=talent-agent'),
    icon: Database,
  },
  {
    label: '人才 Agent',
    subtitle: '项目匹配',
    href: '/admin?tab=talent-agent',
    match: (pathname: string, search = '') => pathname.startsWith('/admin') && search.includes('tab=talent-agent'),
    icon: Users,
  },
];

const BrandMark = ({ compact = false }: { compact?: boolean }) => (
  <Link to="/" className="flex min-w-0 items-center gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[#007aff] text-[13px] font-semibold tracking-[-0.02em] text-white shadow-[0_12px_28px_rgba(0,122,255,0.20)]">
      MPT
    </span>
    {!compact && (
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-white">
          MPT Platform
        </span>
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
          Assessment Console
        </span>
      </span>
    )}
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAdminAuth();
  const isManagementArea =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/review');
  const isTalentAgent = location.pathname.startsWith('/admin') && location.search.includes('tab=talent-agent');

  const navItems = isManagementArea && isAuthenticated ? adminNavItems : publicNavItems;

  const activeTitle = (() => {
    if (isTalentAgent) return '高阶影视人才 Agent';
    if (location.pathname.startsWith('/admin')) {
      return isAuthenticated ? '后台中控' : '管理入口';
    }
    if (location.pathname.startsWith('/review')) return '人工复核';
    if (location.pathname.startsWith('/onboarding')) return '项目引导';
    return '新人五维测评';
  })();

  const activeSubtitle = (() => {
    if (isTalentAgent) return '智能评测、项目匹配与人才库';
    if (location.pathname.startsWith('/admin')) return '评分与数据管理';
    if (location.pathname.startsWith('/review')) return '主观题人工复核';
    if (location.pathname.startsWith('/onboarding')) return '新人学习路径';
    return 'MPT Platform';
  })();

  if (!isManagementArea) {
    return (
      <div className="min-h-screen bg-[#020204] text-white selection:bg-[#007aff]/30 selection:text-white">
        <header className="sticky top-0 z-40 border-b border-white/8 bg-[#020204]/82 backdrop-blur-2xl">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
            <BrandMark />

            <nav className="hidden items-center gap-12 text-sm font-medium text-white/58 md:flex">
              <Link to="/#assessment-intro" className="transition-colors hover:text-white">
                测评介绍
              </Link>
              <Link to="/#dimension-guide" className="transition-colors hover:text-white">
                测评维度
              </Link>
              <Link to="/#faq" className="transition-colors hover:text-white">
                常见问题
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden h-10 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-3 text-sm font-medium text-white/70 transition hover:border-[#007aff]/60 hover:bg-white/[0.08] hover:text-white sm:inline-flex"
                title="语言切换"
              >
                <Globe2 className="h-4 w-4" />
                中 / EN
              </button>
              <Link
                to="/admin"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/16 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:border-[#007aff]/70 hover:bg-white/[0.1]"
              >
                <LogIn className="h-4 w-4" />
                登录
              </Link>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="apple-admin-shell min-h-screen bg-[#f5f5f7] text-[#1d1d1f] selection:bg-[#007aff]/15 selection:text-[#1d1d1f]">
      <nav className="fixed left-0 top-0 z-40 hidden h-full w-[96px] flex-col border-r border-[#e5e5ea] bg-[#fbfbfd]/92 px-3 py-5 backdrop-blur-2xl lg:flex">
        <div className="mb-8 flex flex-col items-center">
          <BrandMark compact />
          <p className="mt-3 text-center text-[11px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">MPT</p>
          <p className="mt-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
            Console
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match(location.pathname, location.search);
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-h-[74px] flex-col items-center justify-center rounded-[24px] border px-2 text-center transition-all ${
                  active
                    ? 'border-[#b9dcff] bg-[#eaf4ff] text-[#007aff] shadow-[0_12px_28px_rgba(0,122,255,0.08)]'
                    : 'border-transparent text-[#6e6e73] hover:border-[#e5e5ea] hover:bg-white hover:text-[#1d1d1f]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="mt-1.5 text-[11px] font-semibold leading-tight tracking-[-0.01em]">
                  {item.label}
                </span>
                <span className="mt-0.5 text-[9px] font-medium leading-tight opacity-55">
                  {item.subtitle}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-[24px] border border-[#e5e5ea] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f7] text-[#007aff]">
              <User className="h-4 w-4" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-[#1d1d1f]">
                {isAuthenticated ? '管理员' : '用户'}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#007aff]">
                {isAuthenticated ? 'ADMIN' : 'USER'}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <header className="fixed left-0 right-0 top-0 z-30 flex min-h-[82px] items-center justify-between border-b border-[#e5e5ea]/90 bg-white/78 px-4 backdrop-blur-2xl lg:left-[96px] lg:px-10">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#007aff]">
            Muchen AI Operating System
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            {activeTitle}
          </h1>
          <p className="mt-0.5 text-xs font-medium text-[#86868b]">{activeSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isManagementArea && isAuthenticated && (
            <>
              <div className="relative hidden items-center md:flex">
                <Search className="absolute left-3.5 h-4 w-4 text-[#86868b]" />
                <input
                  type="text"
                  placeholder="搜索候选人、项目或记录..."
                  className="h-10 w-56 rounded-full border border-[#e5e5ea] bg-[#f5f5f7] py-1.5 pl-10 pr-4 text-xs text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:w-72 focus:border-[#007aff]/50 focus:bg-white focus:ring-4 focus:ring-[#007aff]/10"
                />
              </div>
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5ea] bg-white text-[#6e6e73] transition-all hover:border-[#007aff]/30 hover:text-[#007aff] hover:shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
                title="通知中心"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e5e5ea] bg-white px-4 text-xs font-semibold text-[#1d1d1f] transition-all hover:border-[#007aff]/30 hover:text-[#007aff] hover:shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                退出管理
              </button>
            </>
          )}
        </div>
      </header>

      <main className="min-h-screen px-4 pb-14 pt-[104px] lg:ml-[96px] lg:px-10">
        <div className={`mx-auto w-full ${isTalentAgent ? 'max-w-[1240px]' : 'max-w-[1360px]'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
