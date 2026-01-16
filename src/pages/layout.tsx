// RootLayout.tsx
import { Advertisement, AppFooter, AppHeader } from '@/components/common';
import { Outlet } from 'react-router-dom';

function RootLayout() {
  return (
    <div className="flex">
      {/* 왼쪽 광고 */}
      <aside className="w-64 shrink-0">
        <div className="fixed left-44 top-1/2 -translate-y-1/2 pl-4">
          <div className="h-96 w-64 rounded-lg flex items-center justify-center border border-gray-200 bg-white">
            <Advertisement />
          </div>
        </div>
      </aside>
      <div className="page">
        {/* 전체 컨테이너 - 광고(256px) + 메인(412px) + 여백 */}
        <div className="w-full max-w-175 mx-auto flex flex-col h-full px-4">
          {/* 헤더 */}
          <AppHeader />

          {/* 메인 영역 */}
          <div className="flex-1 w-full flex gap-6">
            {/* 메인 컨텐츠 */}
            <main className="container">
              <Outlet />
            </main>
          </div>

          {/* 푸터 */}
          <AppFooter />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
