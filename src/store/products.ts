import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { TraitKey } from './traits';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  recommendedTrait: TraitKey | null;
  isAvailable: boolean;
  isComingSoon: boolean;
}

interface ProductsState {
  products: Product[];
  recommendations: Product[];
  topTrait: TraitKey | null;
  isLoading: boolean;

  // 액션
  fetchProducts: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  recommendations: [],
  topTrait: null,
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const products: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.image_url,
        price: p.price,
        category: p.category,
        recommendedTrait: p.recommended_trait as TraitKey | null,
        isAvailable: p.is_available,
        isComingSoon: p.is_coming_soon,
      }));

      set({ products });
    } catch (error) {
      console.error('[Products Store] 상품 로드 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecommendations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 사용자의 성향 점수 조회
      const { data: traitData } = await supabase
        .from('trait_scores')
        .select('attention, impulsive, complex, emotional, motivation, environment')
        .eq('user_id', user.id)
        .single();

      if (!traitData) {
        set({ recommendations: [], topTrait: null });
        return;
      }

      // 가장 높은 성향 찾기
      const traits: { key: TraitKey; value: number }[] = [
        { key: 'attention', value: traitData.attention },
        { key: 'impulsive', value: traitData.impulsive },
        { key: 'complex', value: traitData.complex },
        { key: 'emotional', value: traitData.emotional },
        { key: 'motivation', value: traitData.motivation },
        { key: 'environment', value: traitData.environment },
      ];

      const topTrait = traits.reduce((max, t) => (t.value > max.value ? t : max), traits[0]);

      // 해당 성향에 맞는 상품 조회
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .eq('recommended_trait', topTrait.key)
        .order('sort_order', { ascending: true })
        .limit(5);

      if (error) throw error;

      const recommendations: Product[] = (productsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.image_url,
        price: p.price,
        category: p.category,
        recommendedTrait: p.recommended_trait as TraitKey | null,
        isAvailable: p.is_available,
        isComingSoon: p.is_coming_soon,
      }));

      set({
        recommendations,
        topTrait: topTrait.key,
      });
    } catch (error) {
      console.error('[Products Store] 추천 상품 로드 실패:', error);
    }
  },
}));
