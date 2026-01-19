// RootLayout.tsx
import { Advertisement, AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="flex">
      {/* 왼쪽 광고 */}
      <aside className="w-64 shrink-0">
        <div className="left-44 top-1/2 -translate-y-1/2 pl-4">
          <div className="h-96 w-64 rounded-lg flex items-center justify-center border border-gray-200 bg-white">
            <Advertisement />
          </div>
        </div>
      </aside>
      <div className="page">
        {/* 메인 컨테이너 - max-width 412px */}
        <div className="container flex flex-col">
          {/* 헤더 */}
          <AppHeader />

          {/* 메인 영역 */}
          <main className="flex-1 w-full flex flex-col">
            <Outlet />
          </main>

          {/* 푸터 */}
          <AppFooter />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
