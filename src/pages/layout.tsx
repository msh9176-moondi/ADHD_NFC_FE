import { useEffect, useRef, useState } from 'react';
import { Advertisement, AppFooter, AppHeader } from '@/components/common';
import { Outlet } from 'react-router-dom';

function RootLayout() {
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [adLeft, setAdLeft] = useState<number>(16);
  const [showAd, setShowAd] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      if (!pageRef.current) return;

      const rect = pageRef.current.getBoundingClientRect();

      const adWidth = 256; // w-64
      const gap = 24; // page와 광고 사이 간격(px)
      const minMargin = 16; // 화면 왼쪽 최소 여백(px)

      const needSpace = adWidth + gap + minMargin;

      // page 왼쪽 공간이 충분하지 않으면 광고 숨김
      if (rect.left < needSpace) {
        setShowAd(false);
        return;
      }

      setShowAd(true);

      // page 기준 왼쪽에 붙여서 배치
      const left = rect.left - adWidth - gap;
      setAdLeft(left);
    };

    update();
    window.addEventListener('resize', update);

    // 폰트 로딩/레이아웃 변화 같은 케이스 대비(선택)
    const id = window.setTimeout(update, 0);

    return () => {
      window.removeEventListener('resize', update);
      window.clearTimeout(id);
    };
  }, []);

  return (
    <div className="flex">
      {/* 광고: page 기준 왼쪽에 붙고, 스크롤 따라다님 */}
      {showAd && (
        <div
          className="hidden lg:block fixed top-1/2 -translate-y-1/2 z-40"
          style={{ left: adLeft }}
        >
          <div className="h-96 w-64 rounded-lg flex items-center justify-center border border-gray-200 bg-[#F5F0E5]">
            <Advertisement />
          </div>
        </div>
      )}

      <div className="page w-full">
        <div
          ref={pageRef}
          className="w-full container mx-auto flex flex-col min-h-screen px-4"
        >
          <AppHeader />

          <div className="flex-1 flex items-center justify-center">
            <main className="container w-full">
              <Outlet />
            </main>
          </div>

          <AppFooter />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
