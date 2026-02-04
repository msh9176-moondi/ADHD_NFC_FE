import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, Package, CheckCircle2 } from 'lucide-react';
import { MOODS } from '@/constants';
import type { Product } from '@/store/products';

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  todayLogs: number;
  moodDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [statsRes, productsRes] = await Promise.allSettled([
        api.get<AdminStats>('/admin/dashboard'),
        api.get<{ products: Product[] }>('/products'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data.products);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 상품 집계
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isAvailable && !p.isComingSoon).length;
  const comingSoonProducts = products.filter((p) => p.isComingSoon).length;
  const inactiveProducts = products.filter((p) => !p.isAvailable && !p.isComingSoon).length;

  // 감정 차트 데이터
  const moodChartData = MOODS.map((m) => ({
    label: m.label,
    count: stats?.moodDistribution?.[m.key] ?? 0,
  }));

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const statCards = [
    {
      key: 'users',
      label: '전체 회원',
      value: stats?.totalUsers ?? 0,
      sub: `오늘 신규 ${stats?.newUsersToday ?? 0}명`,
      Icon: Users,
      bgColor: 'bg-[#FEF3E2]',
      iconColor: 'text-[#DBA67A]',
    },
    {
      key: 'activity',
      label: '오늘 활동',
      value: stats?.todayLogs ?? 0,
      sub: '일일 기록 제출 수',
      Icon: Activity,
      bgColor: 'bg-[#E8F5E9]',
      iconColor: 'text-[#66BB6A]',
    },
    {
      key: 'products',
      label: '전체 상품',
      value: totalProducts,
      sub: `준비중 ${comingSoonProducts}개`,
      Icon: Package,
      bgColor: 'bg-[#E3F2FD]',
      iconColor: 'text-[#64B5F6]',
    },
    {
      key: 'active',
      label: '활성 상품',
      value: activeProducts,
      sub: '구매 가능한 상품',
      Icon: CheckCircle2,
      bgColor: 'bg-[#EDE7F6]',
      iconColor: 'text-[#9575CD]',
    },
  ];

  const productStatuses = [
    { label: '판매 중', count: activeProducts, barColor: 'bg-[#66BB6A]' },
    { label: '준비 중', count: comingSoonProducts, barColor: 'bg-[#FFA726]' },
    { label: '비활성', count: inactiveProducts, barColor: 'bg-[#EF5350]' },
  ];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#795549]">관리자 대시보드</h1>
        <p className="text-sm text-[#795549]/55 mt-1">{dateStr}</p>
      </div>

      {/* 요약 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.Icon;
          return (
            <div key={card.key} className="bg-white rounded-2xl p-5 shadow-sm border border-[#DBA67A]/15">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#795549]/55">{card.label}</p>
                  <p className="text-2xl font-bold text-[#795549] mt-1">
                    {isLoading ? '—' : card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#795549]/45 mt-1">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 섹션: 감정 분포 + 상품 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 감정 분포 차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DBA67A]/15">
          <h2 className="text-sm font-semibold text-[#795549]">오늘의 감정 분포</h2>
          <p className="text-xs text-[#795549]/45 mb-4">전체 사용자 기준</p>

          {!stats ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-[#795549]/40">
                {isLoading ? '로딩 중...' : '/admin/dashboard API 연동 후 표시됩니다'}
              </p>
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodChartData} barSize={36}>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#795549' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#795549' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(219,166,122,0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="count" fill="#DBA67A" radius={[6, 6, 0, 0]} name="건수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-4 mt-2">
                {MOODS.map((m) => (
                  <div key={m.key} className="flex items-center gap-1">
                    <span className="text-base" aria-hidden>{m.emoji}</span>
                    <span className="text-xs text-[#795549]/55">{m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 상품 현황 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DBA67A]/15">
          <h2 className="text-sm font-semibold text-[#795549]">상품 현황</h2>
          <p className="text-xs text-[#795549]/45 mb-4">상태별 상품 구성</p>

          {isLoading ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-[#795549]/40">로딩 중...</p>
            </div>
          ) : totalProducts === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-[#795549]/40">등록된 상품이 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col justify-center h-52 space-y-5">
              {productStatuses.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-[#795549] mb-1.5">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[#795549]/45">{item.count}개</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F0E5] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#DBA67A]/20">
                <div className="flex justify-between text-xs">
                  <span className="text-[#795549]/55">전체 상품 수</span>
                  <span className="font-bold text-[#795549]">{totalProducts}개</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
