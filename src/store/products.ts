import { create } from 'zustand';
import { api } from '@/lib/api';
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

interface ProductsResponse {
  products: Product[];
}

interface RecommendationsResponse {
  topTrait: TraitKey | null;
  recommendations: Product[];
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
      const response = await api.get<ProductsResponse>('/products');
      set({ products: response.data.products });
    } catch (error) {
      console.error('[Products Store] 상품 로드 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecommendations: async () => {
    try {
      const response = await api.get<RecommendationsResponse>(
        '/products/recommendations',
      );
      set({
        recommendations: response.data.recommendations,
        topTrait: response.data.topTrait,
      });
    } catch (error) {
      console.error('[Products Store] 추천 상품 로드 실패:', error);
    }
  },
}));
