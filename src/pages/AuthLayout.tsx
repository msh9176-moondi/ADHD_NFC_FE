import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div>
      {/* RootLayout이 쓰는 콘텐츠 폭/중앙정렬 톤만 유지 */}
      <div className="min-h-screen flex flex-col items-center">
        <main className="w-103 max-w-full flex flex-col flex-1 px-4 md:px-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
