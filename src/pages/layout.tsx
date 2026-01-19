// RootLayout.tsx
import { Advertisement, AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="flex justify-center">
      {/* 왼쪽 광고 - 콘텐츠(412px) + 광고(256px) + 여백 = md(768px) 이상에서 표시 */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="pl-4">
          <div className="h-96 w-64 rounded-lg flex items-center justify-center border border-gray-200 bg-white">
            <Advertisement />
          </div>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="page">
        <div className="container flex flex-col">
          <AppHeader />

          <main className="flex-1 w-full flex flex-col">
            <Outlet />
          </main>

          <AppFooter />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
