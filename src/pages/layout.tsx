// RootLayout.tsx
import { AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="page">
      {/* 전체 컨테이너 - 광고(256px) + 메인(412px) + 여백 */}
      <div className="w-full max-w-175 mx-auto flex flex-col h-full px-4">
        {/* 헤더 */}
        <AppHeader />

        {/* 메인 영역 */}
        <div className="flex-1 w-full flex gap-6">
          {/* 왼쪽 광고 */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-4">
              <div className="h-96 rounded-lg flex items-center justify-center border border-gray-200">
                광고 영역
              </div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="container">
            <Outlet />
          </main>
        </div>

        {/* 푸터 */}
        <AppFooter />
      </div>
    </div>
  );
}

export default RootLayout;
