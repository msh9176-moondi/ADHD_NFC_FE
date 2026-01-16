import { NavLink } from 'react-router-dom';

const items = [
  { to: '/reward', label: '보상' },
  { to: '/report', label: '기록' },
  { to: '/market', label: '마켓' },
  { to: '/growth', label: '성장' },
  { to: '/profile', label: '프로필' },
];

function AppFooter() {
  return (
    <footer className=" border-gray-200 bg-[#F5F0E5]">
      <nav>
        <ul className="flex items-center justify-between py-4">
          {items.map((item) => (
            <li key={item.to} className="flex-1 flex justify-center">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    // 터치 영역은 크게
                    'inline-flex items-center justify-center px-2 py-1',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <div
                    className={[
                      'w-[35px] h-[35px] rounded-full',
                      'flex items-center justify-center',
                      'text-[10px] font-semibold',
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
