import { GROWTH_STAGES, type GrowthStage } from '@/constants';
import type { TraitKey, TraitScores } from '@/store/traits';

/**
 * 성향 점수에서 가장 높은 성향을 반환
 */
export function getTopTrait(scores: TraitScores | null): TraitKey | null {
  if (!scores) return null;

  const entries: Array<[TraitKey, number]> = [
    ['attention', scores.attention ?? 0],
    ['impulsive', scores.impulsive ?? 0],
    ['complex', scores.complex ?? 0],
    ['emotional', scores.emotional ?? 0],
    ['motivation', scores.motivation ?? 0],
    ['environment', scores.environment ?? 0],
  ];

  const max = Math.max(...entries.map(([, v]) => v));
  if (max <= 0) return null;

  return entries.find(([, v]) => v === max)?.[0] ?? null;
}

/**
 * 레벨에 따른 성장 단계 반환
 */
export function getGrowthStage(level: number): GrowthStage {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (level >= GROWTH_STAGES[i].minLevel) return GROWTH_STAGES[i];
  }
  return GROWTH_STAGES[0];
}

/**
 * 성향 키를 한글 이름으로 변환
 */
export const TRAIT_NAMES: Record<TraitKey, string> = {
  attention: '집중형',
  impulsive: '충동형',
  complex: '복합형',
  emotional: '감정형',
  motivation: '동기형',
  environment: '환경형',
};

/**
 * 성향별 설명 텍스트
 */
/**
 * TraitKey를 TypeReport URL 경로용 키로 변환
 * (motivation → motivational 변환 필요)
 */
export const TRAIT_KEY_MAP: Record<TraitKey, string> = {
  attention: 'attention',
  impulsive: 'impulsive',
  complex: 'complex',
  emotional: 'emotional',
  motivation: 'motivational',
  environment: 'environment',
};

export const TRAIT_DESCRIPTIONS: Record<TraitKey, [string, string]> = {
  attention: ['머리는 준비됐는데,', '시작 버튼이 안 눌리는 타입이에요.'],
  impulsive: [
    '반응이 먼저 나와요.',
    '흥분하면 속도 조절이 어려울 수 있어요.',
  ],
  complex: ['날마다 컨디션이 달라요.', '잘될 때,안될 때 기복이 커요.'],
  emotional: ['작은 자극에도 흔들려요.', '회복까지 시간이 걸릴 수 있어요.'],
  motivation: [
    '중요한 걸 알아도 시동이 늦어요.',
    '외부 압박이 트리거가 돼요.',
  ],
  environment: [
    '환경에 따라 성능이 바뀌어요.',
    '집에서는 특히 막힐 수 있어요.',
  ],
};
