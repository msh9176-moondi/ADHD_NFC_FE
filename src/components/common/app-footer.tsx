import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/reward', label: '보상' },
  { to: '/report', label: '기록' },
  { to: '/market', label: '마켓' },
  { to: '/growth', label: '성장' },
  { to: '/profile', label: '프로필' },
];

// 크림색 배경을 사용하는 페이지 경로
const CREAM_BG_PATHS = ['/reward', '/report', '/market'];

function AppFooter() {
  const location = useLocation();

  // 현재 경로가 크림색 배경 페이지인지 확인
  const isCreamBg = CREAM_BG_PATHS.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + '/'),
  );

  const bgColor = isCreamBg ? 'bg-[#F5F0E5]' : 'bg-white';

  return (
    <footer
      className={`sticky bottom-0 z-50 w-full ${bgColor}`}
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <nav className="w-full">
        <ul className="w-full flex items-center justify-around mt-0 py-4">
          {items.map((item) => (
            <li key={item.to} className="flex-1 flex justify-center">
              <NavLink
                to={item.to}
                className={() =>
                  ['inline-flex items-center justify-center px-2 py-1'].join(
                    ' ',
                  )
                }
              >
                {({ isActive }) => (
                  <div
                    className={[
                      'w-12.5 h-12.5 rounded-full object-cover',
                      'flex items-center justify-center',
                      'text-[13px] font-semibold',
                      isActive
                        ? 'bg-[#795549] text-white'
                        : 'bg-[#DBA67A] text-white',
                    ].join(' ')}
                  >
                    {item.label}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

export { AppFooter };
