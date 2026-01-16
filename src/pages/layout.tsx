// RootLayout.tsx
import { AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="page">
      <AppHeader />

      {/* 가로 배치 컨테이너 */}
      <div className="flex-1 w-full flex justify-center">
        {/* 왼쪽 광고 */}
        <aside className="w-64">
          <div className="sticky top-4">
            <div className="bg-white h-96 rounded-lg flex items-center justify-center">
              광고 영역 (250x400)
            </div>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="container flex-1">
          <Outlet />
        </main>
      </div>

      <AppFooter />
    </div>
  );
}

export default RootLayout;
