// 루틴 메타 데이터 (통합)
export const ROUTINES_META = [
  {
    id: 'water',
    title: '물 마시기',
    subtitle: '몸에게 주는 작은 선물',
    emoji: '💧',
  },
  {
    id: 'clean',
    title: '청소하기',
    subtitle: '마음도 함께 정돈돼요',
    emoji: '🧹',
  },
  { id: 'walk', title: '걷기', subtitle: '생각이 맑아지는 시간', emoji: '🚶' },
  {
    id: 'meditate',
    title: '명상하기',
    subtitle: '잠시 멈춤의 여유',
    emoji: '🧘',
  },
  {
    id: 'plan',
    title: '계획 세우기',
    subtitle: '내일을 위한 준비',
    emoji: '📝',
  },
] as const;

export type RoutineId = (typeof ROUTINES_META)[number]['id'];
export type RoutineMeta = (typeof ROUTINES_META)[number];

// 성장 단계
export const GROWTH_STAGES = [
  {
    minLevel: 1,
    asset: '/assets/seed/seed-1.svg',
    text: '씨앗이 자라고 있어요!!',
  },
  {
    minLevel: 2,
    asset: '/assets/seed/seed-2.svg',
    text: '씨앗이 돋아났어요!',
  },
  {
    minLevel: 3,
    asset: '/assets/seed/seed-3.svg',
    text: '새싹이 자라고 있어요!!',
  },
  {
    minLevel: 4,
    asset: '/assets/seed/seed-4.svg',
    text: '잎이 무성해졌어요!',
  },
  {
    minLevel: 5,
    asset: '/assets/seed/seed-5.svg',
    text: '작은 나무가 되었어요!',
  },
  {
    minLevel: 6,
    asset: '/assets/seed/seed-6.svg',
    text: '나무가 자라고 있어요!',
  },
  {
    minLevel: 7,
    asset: '/assets/seed/seed-7.svg',
    text: '큰 나무가 되었어요!',
  },
  {
    minLevel: 8,
    asset: '/assets/seed/seed-8.svg',
    text: '나무에 열매가 맺혔어요!',
  },
] as const;

export type GrowthStage = (typeof GROWTH_STAGES)[number];

// 감정 데이터
export const MOODS = [
  { key: 'excited', label: '기쁨', emoji: '🤩' },
  { key: 'calm', label: '평온', emoji: '😊' },
  { key: 'sleepy', label: '피곤', emoji: '😴' },
  { key: 'tired', label: '무기력', emoji: '😣' },
  { key: 'angry', label: '짜증', emoji: '😡' },
] as const;

export type MoodKey = (typeof MOODS)[number]['key'];
export type Mood = (typeof MOODS)[number];

// Report 페이지용 MOODS (label이 약간 다름 - '들뜸' vs '기쁨')
export const MOODS_REPORT = [
  { key: 'excited', label: '들뜸', emoji: '🤩' },
  { key: 'calm', label: '평온', emoji: '😊' },
  { key: 'sleepy', label: '피곤', emoji: '😴' },
  { key: 'tired', label: '무기력', emoji: '😣' },
  { key: 'angry', label: '짜증', emoji: '😡' },
] as const;
