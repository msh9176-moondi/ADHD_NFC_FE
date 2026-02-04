import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
  profile?: {
    nickname?: string;
    name?: string;
    phone?: string;
    profileImage?: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  USER: { label: '일반 회원', bg: 'bg-[#E3F2FD]', text: 'text-[#1976D2]' },
  EXPERT: { label: '전문가', bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]' },
  ADMIN: { label: '관리자', bg: 'bg-[#FEF3E2]', text: 'text-[#E65100]' },
};

const ROLE_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'USER', label: '일반 회원' },
  { value: 'EXPERT', label: '전문가' },
  { value: 'ADMIN', label: '관리자' },
];

const PAGE_SIZE = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

function getInitials(user: AdminUser) {
  const name = user.profile?.nickname || user.email.split('@')[0];
  return name.charAt(0).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const currentUser = useAuthStore((state) => state.user);

  // 목록 상태
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // 필터 / 페이지네이션
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // 상세 패널
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 삭제 확인 모달
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── 검색 debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── 사용자 목록 fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
        if (searchQuery) params.search = searchQuery;
        if (roleFilter !== 'ALL') params.role = roleFilter;

        const res = await api.get<AdminUsersResponse>('/admin/users', { params });
        setUsers(res.data.users);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('[Admin] 사용자 목록 로드 실패:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, searchQuery, roleFilter]);

  // ── 현재 계정 여부 ──────────────────────────────────────────────────────────
  const isSelf = selectedUser?.id === currentUser?.id;

  // ── 역할 변경 ────────────────────────────────────────────────────────────────
  const handleRoleChange = async (newRole: string) => {
    if (!selectedUser || selectedUser.role === newRole || isSelf) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}`, { role: newRole });
      const updated = { ...selectedUser, role: newRole as AdminUser['role'] };
      setSelectedUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    } catch (error) {
      console.error('[Admin] 역할 변경 실패:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ── 계정 정지 토글 ──────────────────────────────────────────────────────────
  const handleSuspendToggle = async () => {
    if (!selectedUser || isSelf) return;
    setActionLoading(true);
    try {
      const newActive = !selectedUser.isActive;
      await api.patch(`/admin/users/${selectedUser.id}/status`, { isActive: newActive });
      const updated = { ...selectedUser, isActive: newActive };
      setSelectedUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    } catch (error) {
      console.error('[Admin] 계정 상태 변경 실패:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ── 회원 삭제 ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      const remaining = users.filter((u) => u.id !== selectedUser.id);
      setUsers(remaining);
      setTotal((t) => t - 1);
      setSelectedUser(null);
      setConfirmDelete(false);
      // 현재 페이지가 비었으면 이전 페이지로
      if (remaining.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (error) {
      console.error('[Admin] 회원 삭제 실패:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ── 페이지네이션 숫자 계산 ──────────────────────────────────────────────────
  const paginationStart = Math.max(1, page - 2);
  const paginationEnd = Math.min(totalPages, page + 2);
  const pageNumbers: number[] = [];
  for (let i = paginationStart; i <= paginationEnd; i++) pageNumbers.push(i);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 flex gap-6 min-h-full">
      {/* ── 좌측: 사용자 목록 ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#795549]">사용자 관리</h1>
          <p className="text-sm text-[#795549]/55 mt-1">전체 {total.toLocaleString()}명</p>
        </div>

        {/* 검색 입력 */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#795549]/40" />
          <input
            type="text"
            placeholder="닉네임, 이메일로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DBA67A]/25 rounded-xl text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
          />
        </div>

        {/* 역할 필터 버튼 */}
        <div className="flex gap-2 mb-4">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => { setRoleFilter(filter.value); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                roleFilter === filter.value
                  ? 'bg-[#795549] text-white'
                  : 'bg-white border border-[#DBA67A]/25 text-[#795549]/65 hover:border-[#DBA67A]/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 테이블 컨테이너 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#DBA67A]/15 overflow-hidden flex flex-col">
          {/* 테이블 헤더 행 */}
          <div className="grid grid-cols-[2rem_1fr_1.5fr_1fr_1fr] gap-4 items-center px-5 py-3 border-b border-[#DBA67A]/15 bg-[#F5F0E5]/60">
            <div />
            <div className="text-xs font-semibold text-[#795549]/55">회원명</div>
            <div className="text-xs font-semibold text-[#795549]/55">이메일</div>
            <div className="text-xs font-semibold text-[#795549]/55">역할</div>
            <div className="text-xs font-semibold text-[#795549]/55">가입일</div>
          </div>

          {/* 테이블 본문 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">로딩 중...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">검색 결과가 없습니다</p>
              </div>
            ) : (
              users.map((user) => {
                const roleInfo = ROLE_LABELS[user.role];
                const isSelected = selectedUser?.id === user.id;
                const isSelfUser = user.id === currentUser?.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(isSelected ? null : user)}
                    className={`w-full grid grid-cols-[2rem_1fr_1.5fr_1fr_1fr] gap-4 items-center px-5 py-3 border-b border-[#DBA67A]/10 text-left transition-colors ${
                      isSelected ? 'bg-[#F5F0E5]' : 'hover:bg-[#F5F0E5]/50'
                    }`}
                  >
                    {/* 아바타 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        user.isActive ? 'bg-[#DBA67A]' : 'bg-[#795549]/30'
                      }`}
                    >
                      {getInitials(user)}
                    </div>

                    {/* 회원명 + 표지 */}
                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm text-[#795549] font-medium truncate">
                        {user.profile?.nickname || '닉네임 미설정'}
                      </span>
                      {isSelfUser && (
                        <span className="text-xs text-[#795549]/40 shrink-0">(현재 계정)</span>
                      )}
                      {!user.isActive && (
                        <span className="text-xs text-[#EF5350] shrink-0">· 정지</span>
                      )}
                    </div>

                    {/* 이메일 */}
                    <div className="text-sm text-[#795549]/65 truncate">{user.email}</div>

                    {/* 역할 배지 */}
                    <div>
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleInfo.bg} ${roleInfo.text}`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    {/* 가입일 */}
                    <div className="text-sm text-[#795549]/50">{formatDate(user.createdAt)}</div>
                  </button>
                );
              })
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 px-5 py-3.5 border-t border-[#DBA67A]/15">
              {/* 이전 */}
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg text-[#795549]/50 hover:bg-[#F5F0E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* 첫 페이지 + 줄임표 */}
              {paginationStart > 1 && (
                <>
                  <button type="button" onClick={() => setPage(1)} className="w-8 h-8 rounded-lg text-xs text-[#795549]/60 hover:bg-[#F5F0E5] transition-colors">1</button>
                  {paginationStart > 2 && <span className="text-xs text-[#795549]/40 w-4 text-center">…</span>}
                </>
              )}

              {/* 현재 근처 페이지 번호 */}
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    p === page ? 'bg-[#795549] text-white' : 'text-[#795549]/60 hover:bg-[#F5F0E5]'
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* 줄임표 + 마지막 페이지 */}
              {paginationEnd < totalPages && (
                <>
                  {paginationEnd < totalPages - 1 && <span className="text-xs text-[#795549]/40 w-4 text-center">…</span>}
                  <button type="button" onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg text-xs text-[#795549]/60 hover:bg-[#F5F0E5] transition-colors">{totalPages}</button>
                </>
              )}

              {/* 다음 */}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg text-[#795549]/50 hover:bg-[#F5F0E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 우측: 회원 상세 패널 ── */}
      {selectedUser && (
        <aside className="w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-[#DBA67A]/15 overflow-y-auto">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DBA67A]/15">
              <h2 className="text-sm font-bold text-[#795549]">회원 상세</h2>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setConfirmDelete(false); }}
                className="p-1 rounded-lg text-[#795549]/40 hover:bg-[#F5F0E5] hover:text-[#795549] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {/* 아바타 + 회원명 */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                    selectedUser.isActive ? 'bg-[#DBA67A]' : 'bg-[#795549]/30'
                  }`}
                >
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#795549]">
                    {selectedUser.profile?.nickname || '닉네임 미설정'}
                    {isSelf && <span className="text-xs font-normal text-[#795549]/40 ml-1.5">(현재 계정)</span>}
                  </p>
                  <p className="text-xs text-[#795549]/50">{selectedUser.email}</p>
                </div>
              </div>

              {/* 정보 행 목록 */}
              {(
                [
                  { label: '이름', value: selectedUser.profile?.name },
                  { label: '전화번호', value: selectedUser.profile?.phone },
                  { label: '가입일', value: formatDate(selectedUser.createdAt) },
                  { label: '마지막 로그인', value: formatDate(selectedUser.lastLoginAt) },
                  {
                    label: '계정 상태',
                    value: selectedUser.isActive ? '활성' : '정지',
                    colorClass: selectedUser.isActive ? 'font-semibold text-[#388E3C]' : 'font-semibold text-[#EF5350]',
                  },
                ] as Array<{ label: string; value?: string; colorClass?: string }>
              ).map((info) => (
                <div key={info.label} className="flex justify-between items-center py-2.5 border-b border-[#DBA67A]/10">
                  <span className="text-xs font-semibold text-[#795549]/50">{info.label}</span>
                  <span className={`text-xs ${info.colorClass || 'text-[#795549]'}`}>{info.value || '—'}</span>
                </div>
              ))}

              {/* ── 관리 액션 구분선 ── */}
              <div className="border-t border-[#DBA67A]/15 mt-5 pt-5">

                {/* 역할 변경 */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#795549]/50 mb-2">역할 변경</p>
                  {isSelf ? (
                    <p className="text-xs text-[#795549]/40">현재 로그인 계정은 역할을 변경할 수 없습니다</p>
                  ) : (
                    <div className="flex gap-2">
                      {(['USER', 'EXPERT', 'ADMIN'] as const).map((role) => {
                        const info = ROLE_LABELS[role];
                        const isCurrentRole = selectedUser.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            disabled={actionLoading || isCurrentRole}
                            onClick={() => handleRoleChange(role)}
                            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                              isCurrentRole
                                ? `${info.bg} ${info.text} ring-2 ring-[#DBA67A]/30`
                                : 'bg-[#F5F0E5] text-[#795549]/55 hover:bg-[#EDE5D5] disabled:opacity-50'
                            }`}
                          >
                            {info.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 계정 활성화 토글 */}
                <div className="flex items-center justify-between mb-4 py-3 px-3 bg-[#F5F0E5] rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-[#795549]">계정 활성화</p>
                    <p className="text-xs text-[#795549]/45 mt-0.5">
                      {isSelf ? '현재 로그인 계정' : selectedUser.isActive ? '현재 활성 중' : '현재 정지 중'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoading || isSelf}
                    onClick={handleSuspendToggle}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                      selectedUser.isActive ? 'bg-[#795549]' : 'bg-[#795549]/25'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        selectedUser.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 회원 삭제 (현재 계정은 숨김) */}
                {!isSelf && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setConfirmDelete(true)}
                    className="w-full text-xs font-semibold text-[#EF5350] py-2.5 rounded-lg border border-[#EF5350]/30 hover:bg-[#EF5350]/5 transition-colors disabled:opacity-50"
                  >
                    회원 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {confirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-xl">
            {/* 모달 타이틀 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#EF5350]" />
              </div>
              <h3 className="text-sm font-bold text-[#795549]">회원 삭제 확인</h3>
            </div>

            {/* 경고 문구 */}
            <p className="text-xs text-[#795549]/65 leading-relaxed">
              <span className="font-semibold text-[#795549]">
                "{selectedUser.profile?.nickname || selectedUser.email}"
              </span>
              의 계정과 관련된 모든 데이터가 영구 삭제될 것입니다. 이 작업은 되돌릴 수 없습니다.
            </p>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 text-xs font-semibold text-[#795549] py-2.5 rounded-lg bg-[#F5F0E5] hover:bg-[#EDE5D5] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDelete}
                className="flex-1 text-xs font-semibold text-white py-2.5 rounded-lg bg-[#EF5350] hover:bg-[#E53935] transition-colors disabled:opacity-50"
              >
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
