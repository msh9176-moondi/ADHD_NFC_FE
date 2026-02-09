import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ hasFetched: true, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('trait_scores')
        .select('attention, impulsive, complex, emotional, motivation, environment')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[Traits Store] 성향 점수 로드 실패:', error);
      }

      set({
        scores: data ? {
          attention: data.attention,
          impulsive: data.impulsive,
          complex: data.complex,
          emotional: data.emotional,
          motivation: data.motivation,
          environment: data.environment,
        } : null,
        hasFetched: true,
      });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 기존 데이터 확인
      const { data: existing } = await supabase
        .from('trait_scores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        // 업데이트
        result = await supabase
          .from('trait_scores')
          .update(scores)
          .eq('user_id', user.id)
          .select('attention, impulsive, complex, emotional, motivation, environment')
          .single();
      } else {
        // 새로 생성
        result = await supabase
          .from('trait_scores')
          .insert({ user_id: user.id, ...scores })
          .select('attention, impulsive, complex, emotional, motivation, environment')
          .single();
      }

      if (result.error) throw result.error;

      set({
        scores: result.data ? {
          attention: result.data.attention,
          impulsive: result.data.impulsive,
          complex: result.data.complex,
          emotional: result.data.emotional,
          motivation: result.data.motivation,
          environment: result.data.environment,
        } : null,
      });
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
