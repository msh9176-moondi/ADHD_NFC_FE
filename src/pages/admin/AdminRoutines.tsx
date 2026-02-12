import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, X, AlertTriangle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminRoutine {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  isActive: boolean;
  order: number;
  totalCompletions: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: '활성', bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]' },
  INACTIVE: { label: '비활성', bg: 'bg-[#EEEEEE]', text: 'text-[#757575]' },
};

// ─── Form State ───────────────────────────────────────────────────────────────

interface RoutineForm {
  title: string;
  subtitle: string;
  emoji: string;
  isActive: boolean;
  order: number;
}

const EMPTY_FORM: RoutineForm = {
  title: '',
  subtitle: '',
  emoji: '',
  isActive: true,
  order: 0,
};

function routineToForm(r: AdminRoutine): RoutineForm {
  return {
    title: r.title,
    subtitle: r.subtitle,
    emoji: r.emoji,
    isActive: r.isActive,
    order: r.order,
  };
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 ${
        checked ? 'bg-[#795549]' : 'bg-[#795549]/25'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type PanelMode = 'closed' | 'add' | 'edit';

export default function AdminRoutines() {
  // 목록
  const [routines, setRoutines] = useState<AdminRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 필터
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 우측 패널
  const [panelMode, setPanelMode] = useState<PanelMode>('closed');
  const [selectedRoutine, setSelectedRoutine] = useState<AdminRoutine | null>(null);
  const [form, setForm] = useState<RoutineForm>(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // 삭제 모달
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── 검색 debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── 루틴 목록 fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRoutines = async () => {
      setIsLoading(true);
      try {
        // 루틴 목록 조회
        const { data: routinesData, error: routinesError } = await supabase
          .from('routines')
          .select('*')
          .order('order', { ascending: true });

        if (routinesError) throw routinesError;

        // 완료 횟수 계산을 위해 daily_logs에서 completed_routines 집계
        const { data: logsData } = await supabase
          .from('daily_logs')
          .select('completed_routines');

        const completionCounts: Record<string, number> = {};
        if (logsData) {
          for (const log of logsData) {
            const routineIds = log.completed_routines || [];
            for (const rid of routineIds) {
              completionCounts[rid] = (completionCounts[rid] || 0) + 1;
            }
          }
        }

        const mappedRoutines: AdminRoutine[] = (routinesData || []).map((r) => ({
          id: r.id,
          title: r.title || '',
          subtitle: r.subtitle || '',
          emoji: r.emoji || '',
          isActive: r.is_active !== false,
          order: r.order || 0,
          totalCompletions: completionCounts[r.id] || 0,
        }));

        setRoutines(mappedRoutines);
      } catch (error) {
        console.error('[Admin] 루틴 목록 로드 실패:', error);
        setRoutines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  // ── 클라이언트 필터 ────────────────────────────────────────────────────────
  const filteredRoutines = useMemo(() => {
    return routines.filter((r) => {
      if (statusFilter === 'ACTIVE' && !r.isActive) return false;
      if (statusFilter === 'INACTIVE' && r.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.subtitle.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [routines, statusFilter, searchQuery]);

  // ── 패널 열기 / 닫기 ───────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedRoutine(null);
    setForm({ ...EMPTY_FORM, order: routines.length + 1 });
    setPanelMode('add');
    setFormError('');
    setConfirmDelete(false);
  };

  const openEdit = (routine: AdminRoutine) => {
    setSelectedRoutine(routine);
    setForm(routineToForm(routine));
    setPanelMode('edit');
    setFormError('');
    setConfirmDelete(false);
  };

  const closePanel = () => {
    setPanelMode('closed');
    setSelectedRoutine(null);
    setConfirmDelete(false);
    setFormError('');
  };

  // ── 폼 핸들러 ───────────────────────────────────────────────────────────────
  const setField = <K extends keyof RoutineForm>(field: K, value: RoutineForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const validate = (): boolean => {
    if (!form.title.trim()) { setFormError('루틴 이름을 입력해주세요'); return false; }
    if (!form.emoji.trim()) { setFormError('이모지를 입력해주세요'); return false; }
    return true;
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('routines')
        .insert({
          title: form.title,
          subtitle: form.subtitle,
          emoji: form.emoji,
          is_active: form.isActive,
          order: form.order,
        })
        .select()
        .single();

      if (error) throw error;

      const newRoutine: AdminRoutine = {
        id: data.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        emoji: data.emoji || '',
        isActive: data.is_active !== false,
        order: data.order || 0,
        totalCompletions: 0,
      };

      setRoutines((prev) => [...prev, newRoutine].sort((a, b) => a.order - b.order));
      closePanel();
    } catch (error) {
      console.error('[Admin] 루틴 추가 실패:', error);
      setFormError('루틴 추가에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !selectedRoutine) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('routines')
        .update({
          title: form.title,
          subtitle: form.subtitle,
          emoji: form.emoji,
          is_active: form.isActive,
          order: form.order,
        })
        .eq('id', selectedRoutine.id)
        .select()
        .single();

      if (error) throw error;

      const updatedRoutine: AdminRoutine = {
        id: data.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        emoji: data.emoji || '',
        isActive: data.is_active !== false,
        order: data.order || 0,
        totalCompletions: selectedRoutine.totalCompletions,
      };

      setRoutines((prev) => prev.map((r) => (r.id === selectedRoutine.id ? updatedRoutine : r)));
      setSelectedRoutine(updatedRoutine);
    } catch (error) {
      console.error('[Admin] 루틴 수정 실패:', error);
      setFormError('루틴 수정에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoutine) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', selectedRoutine.id);

      if (error) throw error;

      setRoutines((prev) => prev.filter((r) => r.id !== selectedRoutine.id));
      closePanel();
    } catch (error) {
      console.error('[Admin] 루틴 삭제 실패:', error);
      setFormError('루틴 삭제에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-6 min-h-full">
      {/* ── 좌측: 루틴 목록 ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#795549]">루틴 관리</h1>
            <p className="text-xs md:text-sm text-[#795549]/55 mt-1">전체 {routines.length}개</p>
          </div>

          <button
            type="button"
            onClick={panelMode === 'add' ? closePanel : openAdd}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
              panelMode === 'add'
                ? 'bg-[#795549] text-white'
                : 'bg-[#DBA67A] text-white hover:bg-[#C9956A]'
            }`}
          >
            <Plus className={`w-4 h-4 transition-transform duration-300 ${panelMode === 'add' ? 'rotate-45' : ''}`} />
            {panelMode === 'add' ? '취소' : '새 루틴'}
          </button>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#795549]/40" />
          <input
            type="text"
            placeholder="루틴 이름, 설명으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DBA67A]/25 rounded-xl text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
          />
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === filter.value
                  ? 'bg-[#795549] text-white'
                  : 'bg-white border border-[#DBA67A]/25 text-[#795549]/65 hover:border-[#DBA67A]/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 루틴 테이블 */}
        <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#DBA67A]/15 overflow-hidden flex flex-col">
          {/* 테이블 헤더 (데스크탑만) */}
          <div className="hidden md:grid grid-cols-[2.5rem_1fr_6rem_7rem] gap-3 items-center px-4 py-3 border-b border-[#DBA67A]/15 bg-[#F5F0E5]/60">
            <div className="text-xs font-semibold text-[#795549]/55">#</div>
            <div className="text-xs font-semibold text-[#795549]/55">루틴</div>
            <div className="text-xs font-semibold text-[#795549]/55">상태</div>
            <div className="text-xs font-semibold text-[#795549]/55 text-right">완료 횟수</div>
          </div>

          {/* 테이블 본문 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">로딩 중...</p>
              </div>
            ) : filteredRoutines.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredRoutines.map((routine) => {
                const badge = STATUS_BADGE[routine.isActive ? 'ACTIVE' : 'INACTIVE'];
                const isSelected = selectedRoutine?.id === routine.id;

                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => (isSelected && panelMode === 'edit') ? closePanel() : openEdit(routine)}
                    className={`w-full flex md:grid md:grid-cols-[2.5rem_1fr_6rem_7rem] gap-3 items-center px-4 py-3.5 border-b border-[#DBA67A]/10 text-left transition-colors ${
                      isSelected ? 'bg-[#F5F0E5]' : 'hover:bg-[#F5F0E5]/50'
                    }`}
                  >
                    {/* 이모지 (모바일에서는 순서 대신 이모지만) */}
                    <div className="w-8 h-8 rounded-lg bg-[#F5F0E5] flex items-center justify-center shrink-0 md:hidden">
                      <span className="text-base" aria-hidden>{routine.emoji}</span>
                    </div>

                    {/* 데스크탑: 순서 */}
                    <div className="hidden md:block text-xs font-semibold text-[#795549]/45">{routine.order}</div>

                    {/* 모바일: 루틴명 + 상태 */}
                    <div className="flex-1 min-w-0 md:hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm text-[#795549] font-medium truncate">{routine.title}</p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#795549]/50 truncate mt-0.5">{routine.totalCompletions.toLocaleString()}회 완료</p>
                    </div>

                    {/* 데스크탑: 이모지 + 이름 */}
                    <div className="hidden md:flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F0E5] flex items-center justify-center shrink-0">
                        <span className="text-base" aria-hidden>{routine.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#795549] font-medium truncate">{routine.title}</p>
                        <p className="text-xs text-[#795549]/45 truncate">{routine.subtitle || '—'}</p>
                      </div>
                    </div>

                    {/* 데스크탑: 상태 배지 */}
                    <div className="hidden md:block">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* 데스크탑: 완료 횟수 */}
                    <div className="hidden md:block text-xs font-semibold text-[#795549]/55 text-right">
                      {routine.totalCompletions.toLocaleString()}회
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 우측: 추가 / 편집 패널 ── */}
      {panelMode !== 'closed' && (
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#DBA67A]/15 overflow-y-auto">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DBA67A]/15">
              <h2 className="text-sm font-bold text-[#795549]">
                {panelMode === 'add' ? '새 루틴 추가' : '루틴 편집'}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="p-1 rounded-lg text-[#795549]/40 hover:bg-[#F5F0E5] hover:text-[#795549] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 이모지 미리보기 */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-[#F5F0E5] flex items-center justify-center border border-[#DBA67A]/20">
                  <span className="text-3xl" aria-hidden>{form.emoji || '❓'}</span>
                </div>
              </div>

              {/* 루틴 이름 */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">루틴 이름 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="루틴 이름 입력"
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">설명</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setField('subtitle', e.target.value)}
                  placeholder="루틴 설명 입력"
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                />
              </div>

              {/* 이모지 + 순서 (2열) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#795549]/55">이모지 *</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setField('emoji', e.target.value)}
                    placeholder="💧"
                    className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#795549]/55">표시 순서</label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setField('order', Math.max(1, Number(e.target.value)))}
                    placeholder="1"
                    className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                  />
                </div>
              </div>

              {/* 활성화 토글 */}
              <div className="flex items-center justify-between py-3 px-3 bg-[#F5F0E5] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-[#795549]">루틴 활성화</p>
                  <p className="text-xs text-[#795549]/45 mt-0.5">{form.isActive ? '사용자에게 표시됨' : '숨겨진 상태'}</p>
                </div>
                <Toggle checked={form.isActive} disabled={actionLoading} onChange={() => setField('isActive', !form.isActive)} />
              </div>

              {/* 완료 횟수 정보 (편집 모드에서만) */}
              {panelMode === 'edit' && selectedRoutine && (
                <div className="flex items-center gap-2 py-2.5 px-3 bg-[#FEF3E2] rounded-xl">
                  <span className="text-xs text-[#795549]/65">누적 완료 횟수</span>
                  <span className="text-xs font-bold text-[#795549]">{selectedRoutine.totalCompletions.toLocaleString()}회</span>
                </div>
              )}

              {/* 폼 에러 메시지 */}
              {formError && (
                <p className="text-xs text-[#EF5350] font-semibold">{formError}</p>
              )}

              {/* 액션 버튼 */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={panelMode === 'add' ? handleCreate : handleUpdate}
                  className="w-full text-sm font-semibold text-white py-2.5 rounded-xl bg-[#795549] hover:bg-[#6D4C41] transition-colors disabled:opacity-50"
                >
                  {actionLoading
                    ? (panelMode === 'add' ? '추가 중...' : '저장 중...')
                    : (panelMode === 'add' ? '루틴 추가' : '변경사항 저장')}
                </button>

                {/* 삭제 버튼 (편집 모드에서만) */}
                {panelMode === 'edit' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setConfirmDelete(true)}
                    className="w-full mt-3 text-xs font-semibold text-[#EF5350] py-2.5 rounded-lg border border-[#EF5350]/30 hover:bg-[#EF5350]/5 transition-colors disabled:opacity-50"
                  >
                    루틴 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {confirmDelete && selectedRoutine && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#EF5350]" />
              </div>
              <h3 className="text-sm font-bold text-[#795549]">루틴 삭제 확인</h3>
            </div>

            <p className="text-xs text-[#795549]/65 leading-relaxed">
              <span className="font-semibold text-[#795549]">"{selectedRoutine.emoji} {selectedRoutine.title}"</span>을 삭제하면 사용자의 루틴 목록에서 더 이상 표시되지 않습니다. 기존 완료 기록은 유지되지만 이 작업은 되돌릴 수 없습니다.
            </p>

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
