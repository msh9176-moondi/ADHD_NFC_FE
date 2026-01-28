// RootLayout.tsx
import { Advertisement, AppFooter, AppHeader } from '@/components/common';
import { Outlet } from 'react-router-dom';

function RootLayout() {
  return (
    <div className="min-h-screen flex justify-center">
      {/* 광고 + 콘텐츠 묶음 */}
      <div className="flex gap-16">
        {/* 왼쪽 광고 - 콘텐츠와 함께 중앙 정렬, 세로 중앙 고정 */}
        <aside className="hidden md:block w-64 shrink-0 relative">
          <div className="sticky top-1/2 -translate-y-1/2">
            <div>
              <Advertisement />
            </div>
          </div>
        </aside>

        {/* 메인 영역 */}
        <div className="min-h-screen flex flex-col items-center">
          <div className="w-103 max-w-full flex flex-col flex-1">
            <AppHeader />

            <main className="flex-1 w-full flex flex-col">
              <Outlet />
            </main>

            <AppFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
