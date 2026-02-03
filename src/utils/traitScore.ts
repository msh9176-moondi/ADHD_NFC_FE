export type TraitKey =
  | 'attention'
  | 'impulsive'
  | 'complex'
  | 'emotional'
  | 'motivation'
  | 'environment';

const STORAGE_KEY = 'adhd_trait_scores_v1';

export function readTraitScores(): Partial<Record<TraitKey, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * 성향 점수 저장
 * @param key 성향 키
 * @param rawScore 원본 점수 (0-3, 선택한 문항 개수)
 * 내부적으로 0-100 스케일로 변환하여 저장
 */
export function writeTraitScore(key: TraitKey, rawScore: number) {
  // 0-3 점수를 0-100 스케일로 변환: 0→0, 1→33, 2→67, 3→100
  const scaledScore = Math.round((rawScore / 3) * 100);
  const prev = readTraitScores();
  const next = { ...prev, [key]: scaledScore };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function hasAnyTraitScore() {
  const s = readTraitScores();
  return Object.values(s).some((v) => typeof v === 'number');
}

export function clearTraitScores() {
  localStorage.removeItem(STORAGE_KEY);
}
