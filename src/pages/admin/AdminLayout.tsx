import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ClipboardList,
  FileText,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', Icon: LayoutDashboard, end: true, disabled: false },
  { to: '/admin/users', label: '사용자 관리', Icon: Users, end: false, disabled: false },
  { to: '/admin/products', label: '상품 관리', Icon: ShoppingBag, end: false, disabled: false },
  { to: '/admin/routines', label: '루틴 관리', Icon: ClipboardList, end: false, disabled: false },
  { to: '/admin/logs', label: '활동 기록', Icon: FileText, end: false, disabled: true },
];

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F0E5]">
      {/* 모바일 헤더 */}
      <header className="md:hidden bg-[#5D4037] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#DBA67A] flex items-center justify-center">
            <span className="text-base" aria-hidden>🌳</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">FLOCA</h1>
            <p className="text-[10px] text-white/50">관리자 패널</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* 모바일 메뉴 드롭다운 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#5D4037] px-4 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;
            if (item.disabled) {
              return (
                <div key={item.to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/30">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40">준비중</span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/65'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => { handleNavClick(); navigate('/profile'); }}
            className="w-full flex items-center gap-3 text-white/55 text-sm px-4 py-2.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>앱으로 돌아가기</span>
          </button>
        </div>
      )}

      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex w-64 bg-[#5D4037] flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DBA67A] flex items-center justify-center">
              <span className="text-lg" aria-hidden>🌳</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">FLOCA</h1>
              <p className="text-xs text-white/50">관리자 패널</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mx-4" />

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;

            if (item.disabled) {
              return (
                <div key={item.to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/30">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/40">준비중</span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 mx-4" />

        <div className="p-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2 text-white/55 hover:text-white text-sm transition-colors px-4 py-2.5 rounded-xl hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>앱으로 돌아가기</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
