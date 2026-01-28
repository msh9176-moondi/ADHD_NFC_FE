import { create } from 'zustand';
import { api } from '@/lib/api';

export type TraitKey =
  | 'attention'
  | 'impulsive'
  | 'complex'
  | 'emotional'
  | 'motivation'
  | 'environment';

export interface TraitScores {
  attention: number;
  impulsive: number;
  complex: number;
  emotional: number;
  motivation: number;
  environment: number;
}

interface TraitScoreResponse {
  traitScore: TraitScores | null;
}

interface TraitsState {
  scores: TraitScores | null;
  isLoading: boolean;
  hasFetched: boolean;

  // 액션
  fetchTraits: () => Promise<void>;
  updateTraits: (scores: Partial<TraitScores>) => Promise<void>;
  hasAnyScore: () => boolean;
}

export const useTraitsStore = create<TraitsState>((set, get) => ({
  scores: null,
  isLoading: false,
  hasFetched: false,

  fetchTraits: async () => {
    set({ isLoading: true });
    try {
      console.log('[Traits Store] fetchTraits 호출');
      const response = await api.get<TraitScoreResponse>('/traits');
      console.log('[Traits Store] API 응답:', response.data);
      set({
        scores: response.data.traitScore,
        hasFetched: true,
      });
      console.log('[Traits Store] 스토어 업데이트 완료:', response.data.traitScore);
    } catch (error) {
      console.error('[Traits Store] 성향 점수 로드 실패:', error);
      set({ hasFetched: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTraits: async (scores: Partial<TraitScores>) => {
    set({ isLoading: true });
    try {
      console.log('[Traits Store] updateTraits 호출:', scores);
      const response = await api.put<TraitScoreResponse>('/traits', scores);
      console.log('[Traits Store] 저장 응답:', response.data);
      set({ scores: response.data.traitScore });
      console.log('[Traits Store] 스토어 업데이트 완료');
    } catch (error) {
      console.error('[Traits Store] 성향 점수 저장 실패:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  hasAnyScore: () => {
    const { scores } = get();
    if (!scores) return false;
    return Object.values(scores).some((v) => typeof v === 'number' && v > 0);
  },
}));
