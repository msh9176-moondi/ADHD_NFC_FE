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

export function writeTraitScore(key: TraitKey, score: number) {
  const prev = readTraitScores();
  const next = { ...prev, [key]: score };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function hasAnyTraitScore() {
  const s = readTraitScores();
  return Object.values(s).some((v) => typeof v === 'number');
}
