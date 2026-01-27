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
      const response = await api.get<TraitScoreResponse>('/traits');
      set({
        scores: response.data.traitScore,
        hasFetched: true,
      });
    } catch (error) {
      console.error('성향 점수 로드 실패:', error);
      set({ hasFetched: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTraits: async (scores: Partial<TraitScores>) => {
    set({ isLoading: true });
    try {
      const response = await api.put<TraitScoreResponse>('/traits', scores);
      set({ scores: response.data.traitScore });
    } catch (error) {
      console.error('성향 점수 저장 실패:', error);
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
