import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, X, AlertTriangle } from 'lucide-react';
import type { Product } from '@/store/products';

// ─── Constants ───────────────────────────────────────────────────────────────

const TRAIT_LABELS: Record<string, string> = {
  attention: '집중형',
  impulsive: '충동형',
  complex: '복합형',
  emotional: '감정형',
  motivation: '동기형',
  environment: '환경형',
};

const TRAIT_OPTIONS = [
  { value: '', label: '없음' },
  { value: 'attention', label: '집중형' },
  { value: 'impulsive', label: '충동형' },
  { value: 'complex', label: '복합형' },
  { value: 'emotional', label: '감정형' },
  { value: 'motivation', label: '동기형' },
  { value: 'environment', label: '환경형' },
];

const STATUS_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'SALE', label: '판매 중' },
  { value: 'COMING', label: '준비 중' },
  { value: 'INACTIVE', label: '비활성' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ProductStatus = 'SALE' | 'COMING' | 'INACTIVE';

function getProductStatus(product: Product): ProductStatus {
  if (product.isComingSoon) return 'COMING';
  if (product.isAvailable) return 'SALE';
  return 'INACTIVE';
}

const STATUS_BADGE: Record<ProductStatus, { label: string; bg: string; text: string }> = {
  SALE: { label: '판매 중', bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]' },
  COMING: { label: '준비 중', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  INACTIVE: { label: '비활성', bg: 'bg-[#EEEEEE]', text: 'text-[#757575]' },
};

// ─── Form State ──────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  recommendedTrait: string;
  isAvailable: boolean;
  isComingSoon: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  category: '',
  recommendedTrait: '',
  isAvailable: true,
  isComingSoon: false,
};

function productToForm(p: Product): ProductForm {
  return {
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    price: p.price,
    category: p.category,
    recommendedTrait: p.recommendedTrait || '',
    isAvailable: p.isAvailable,
    isComingSoon: p.isComingSoon,
  };
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  disabled,
  onColor,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onColor?: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 ${
        checked ? onColor || 'bg-[#795549]' : 'bg-[#795549]/25'
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

// ─── Component ───────────────────────────────────────────────────────────────

type PanelMode = 'closed' | 'add' | 'edit';

export default function AdminProducts() {
  // 목록
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 필터
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 우측 패널
  const [panelMode, setPanelMode] = useState<PanelMode>('closed');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // 삭제 모달
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── 검색 debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── 상품 목록 fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProducts: Product[] = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          imageUrl: p.image_url || '',
          price: p.price || 0,
          category: p.category || '',
          recommendedTrait: p.recommended_trait || '',
          isAvailable: p.is_available !== false,
          isComingSoon: p.is_coming_soon === true,
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error('[Admin] 상품 목록 로드 실패:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ── 클라이언트 필터 ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== 'ALL' && getProductStatus(p) !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, statusFilter, searchQuery]);

  // ── 패널 열기 / 닫기 ───────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedProduct(null);
    setForm(EMPTY_FORM);
    setPanelMode('add');
    setFormError('');
    setConfirmDelete(false);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setForm(productToForm(product));
    setPanelMode('edit');
    setFormError('');
    setConfirmDelete(false);
  };

  const closePanel = () => {
    setPanelMode('closed');
    setSelectedProduct(null);
    setConfirmDelete(false);
    setFormError('');
  };

  // ── 폼 핸들러 ───────────────────────────────────────────────────────────────
  const setField = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const validate = (): boolean => {
    if (!form.name.trim()) { setFormError('상품명을 입력해주세요'); return false; }
    if (!form.imageUrl.trim()) { setFormError('이미지 URL을 입력해주세요'); return false; }
    if (form.price < 0) { setFormError('가격은 0 이상이어야 합니다'); return false; }
    return true;
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: form.name,
          description: form.description,
          image_url: form.imageUrl,
          price: form.price,
          category: form.category,
          recommended_trait: form.recommendedTrait || null,
          is_available: form.isAvailable,
          is_coming_soon: form.isComingSoon,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        imageUrl: data.image_url || '',
        price: data.price || 0,
        category: data.category || '',
        recommendedTrait: data.recommended_trait || '',
        isAvailable: data.is_available !== false,
        isComingSoon: data.is_coming_soon === true,
      };

      setProducts((prev) => [newProduct, ...prev]);
      closePanel();
    } catch (error) {
      console.error('[Admin] 상품 추가 실패:', error);
      setFormError('상품 추가에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !selectedProduct) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: form.name,
          description: form.description,
          image_url: form.imageUrl,
          price: form.price,
          category: form.category,
          recommended_trait: form.recommendedTrait || null,
          is_available: form.isAvailable,
          is_coming_soon: form.isComingSoon,
        })
        .eq('id', selectedProduct.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        imageUrl: data.image_url || '',
        price: data.price || 0,
        category: data.category || '',
        recommendedTrait: data.recommended_trait || '',
        isAvailable: data.is_available !== false,
        isComingSoon: data.is_coming_soon === true,
      };

      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)));
      setSelectedProduct(updatedProduct);
    } catch (error) {
      console.error('[Admin] 상품 수정 실패:', error);
      setFormError('상품 수정에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      closePanel();
    } catch (error) {
      console.error('[Admin] 상품 삭제 실패:', error);
      setFormError('상품 삭제에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-6 min-h-full">
      {/* ── 좌측: 상품 목록 ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#795549]">상품 관리</h1>
            <p className="text-xs md:text-sm text-[#795549]/55 mt-1">전체 {products.length}개</p>
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
            {panelMode === 'add' ? '취소' : '새 상품'}
          </button>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#795549]/40" />
          <input
            type="text"
            placeholder="상품명, 카테고리로 검색..."
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

        {/* 상품 테이블 */}
        <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#DBA67A]/15 overflow-hidden flex flex-col">
          {/* 테이블 헤더 (데스크탑만) */}
          <div className="hidden md:grid grid-cols-[3rem_1fr_5rem_1fr_1fr] gap-3 items-center px-4 py-3 border-b border-[#DBA67A]/15 bg-[#F5F0E5]/60">
            <div />
            <div className="text-xs font-semibold text-[#795549]/55">상품명</div>
            <div className="text-xs font-semibold text-[#795549]/55">가격</div>
            <div className="text-xs font-semibold text-[#795549]/55">상태</div>
            <div className="text-xs font-semibold text-[#795549]/55">추천 성향</div>
          </div>

          {/* 테이블 본문 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">로딩 중...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#795549]/40">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const status = getProductStatus(product);
                const badge = STATUS_BADGE[status];
                const isSelected = selectedProduct?.id === product.id;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => (isSelected && panelMode === 'edit') ? closePanel() : openEdit(product)}
                    className={`w-full flex md:grid md:grid-cols-[3rem_1fr_5rem_1fr_1fr] gap-3 items-center px-4 py-3 border-b border-[#DBA67A]/10 text-left transition-colors ${
                      isSelected ? 'bg-[#F5F0E5]' : 'hover:bg-[#F5F0E5]/50'
                    }`}
                  >
                    {/* 상품 이미지 */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[#F5F0E5] overflow-hidden flex items-center justify-center shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    </div>

                    {/* 모바일: 상품명 + 가격 + 상태 */}
                    <div className="flex-1 min-w-0 md:hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm text-[#795549] font-medium truncate">{product.name}</p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#795549]/50 mt-0.5">{product.price}원 · {product.category || '미분류'}</p>
                    </div>

                    {/* 데스크탑: 상품명 + 카테고리 */}
                    <div className="hidden md:block min-w-0">
                      <p className="text-sm text-[#795549] font-medium truncate">{product.name}</p>
                      <p className="text-xs text-[#795549]/45">{product.category || '카테고리 미설정'}</p>
                    </div>

                    {/* 데스크탑: 가격 */}
                    <div className="hidden md:block text-sm font-semibold text-[#795549]">{product.price}</div>

                    {/* 데스크탑: 상태 배지 */}
                    <div className="hidden md:block">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* 데스크탑: 추천 성향 */}
                    <div className="hidden md:block text-xs text-[#795549]/55">
                      {product.recommendedTrait ? (TRAIT_LABELS[product.recommendedTrait] || product.recommendedTrait) : '—'}
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
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-[#DBA67A]/15">
              <h2 className="text-sm font-bold text-[#795549]">
                {panelMode === 'add' ? '새 상품 추가' : '상품 편집'}
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
              {/* 이미지 미리보기 */}
              {form.imageUrl && (
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-xl bg-[#F5F0E5] overflow-hidden flex items-center justify-center border border-[#DBA67A]/20">
                    <img src={form.imageUrl} alt="미리보기" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {/* 상품명 */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">상품명 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="상품명 입력"
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="상품 설명 입력"
                  rows={3}
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40 resize-none"
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">이미지 URL *</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setField('imageUrl', e.target.value)}
                  placeholder="/assets/items/example.png"
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                />
              </div>

              {/* 가격 + 카테고리 (2열) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#795549]/55">가격</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setField('price', Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#795549]/55">카테고리</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    placeholder="카테고리"
                    className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] placeholder-[#795549]/40 focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40"
                  />
                </div>
              </div>

              {/* 추천 성향 선택 */}
              <div>
                <label className="text-xs font-semibold text-[#795549]/55">추천 성향</label>
                <select
                  value={form.recommendedTrait}
                  onChange={(e) => setField('recommendedTrait', e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#F5F0E5] rounded-lg text-sm text-[#795549] focus:outline-none focus:ring-2 focus:ring-[#DBA67A]/40 cursor-pointer"
                >
                  {TRAIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 판매 활성화 토글 */}
              <div className="flex items-center justify-between py-3 px-3 bg-[#F5F0E5] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-[#795549]">판매 활성화</p>
                  <p className="text-xs text-[#795549]/45 mt-0.5">{form.isAvailable ? '구매 가능 상태' : '구매 불가 상태'}</p>
                </div>
                <Toggle checked={form.isAvailable} disabled={actionLoading} onChange={() => setField('isAvailable', !form.isAvailable)} />
              </div>

              {/* 준비 중 토글 */}
              <div className="flex items-center justify-between py-3 px-3 bg-[#F5F0E5] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-[#795549]">준비 중</p>
                  <p className="text-xs text-[#795549]/45 mt-0.5">{form.isComingSoon ? '준비 진행 중' : '준비 완료'}</p>
                </div>
                <Toggle checked={form.isComingSoon} disabled={actionLoading} onColor="bg-[#DBA67A]" onChange={() => setField('isComingSoon', !form.isComingSoon)} />
              </div>

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
                    : (panelMode === 'add' ? '상품 추가' : '변경사항 저장')}
                </button>

                {/* 삭제 버튼 (편집 모드에서만) */}
                {panelMode === 'edit' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setConfirmDelete(true)}
                    className="w-full mt-3 text-xs font-semibold text-[#EF5350] py-2.5 rounded-lg border border-[#EF5350]/30 hover:bg-[#EF5350]/5 transition-colors disabled:opacity-50"
                  >
                    상품 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {confirmDelete && selectedProduct && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#EF5350]" />
              </div>
              <h3 className="text-sm font-bold text-[#795549]">상품 삭제 확인</h3>
            </div>

            <p className="text-xs text-[#795549]/65 leading-relaxed">
              <span className="font-semibold text-[#795549]">"{selectedProduct.name}"</span>을 삭제하면 마켓에서 더 이상 표시되지 않습니다. 이 작업은 되돌릴 수 없습니다.
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
