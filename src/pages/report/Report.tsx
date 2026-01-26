import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { useMoodStore, useRoutineStore } from '@/store';

type MoodKey = 'excited' | 'calm' | 'sleepy' | 'tired' | 'angry';

const MOODS: Array<{ key: MoodKey; label: string; emoji: string }> = [
  { key: 'excited', label: '들뜸', emoji: '🤩' },
  { key: 'calm', label: '평온', emoji: '😊' },
  { key: 'sleepy', label: '피곤', emoji: '😴' },
  { key: 'tired', label: '무기력', emoji: '😣' },
  { key: 'angry', label: '짜증', emoji: '😡' },
];

// ✅ 루틴을 id 기반으로 변경 (랭킹/누적에 안전)
const ROUTINES = [
  { id: 'water', title: '물 마시기', subtitle: '몸에게 주는 작은 선물' },
  { id: 'clean', title: '청소하기', subtitle: '마음도 함께 정돈돼요' },
  { id: 'walk', title: '걷기', subtitle: '생각이 맑아지는 시간' },
  { id: 'meditate', title: '명상하기', subtitle: '잠시 멈춤의 여유' },
  { id: 'plan', title: '계획 세우기', subtitle: '내일을 위한 준비' },
] as const;

const SCALE_LABELS = [
  '거의 못함',
  '조금 함',
  '절반 정도',
  '대부분 함',
  '거의 다함',
];

function ReportPage() {
  const navigate = useNavigate();
  const { addCompletions } = useRoutineStore();

  const todayText = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, []);

  const [mood, setMood] = useState<MoodKey>('excited');
  const [routineScore, setRoutineScore] = useState<number>(2); // 0~4
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState('');

  const card = 'bg-white rounded-xl shadow-sm';
  const { addMoodLog } = useMoodStore();

  const handleSubmit = () => {
    // 1) 감정 저장 (프로필 그래프용)
    addMoodLog(mood);
    // ✅ 체크된 루틴 id 추출
    const completedRoutineIds = ROUTINES.map((r, idx) =>
      checked[idx] ? r.id : null,
    ).filter(Boolean) as string[];

    // ✅ 누적 저장(랭킹용)
    addCompletions(completedRoutineIds);

    // 다음 페이지 이동
    navigate('/market');
  };

  return (
    <div className="w-full px-4 pb-24">
      {/* date */}
      <div className="pt-6">
        <div className="text-center text-[14px] font-semibold text-[#795549]">
          {todayText}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* mood */}
        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            오늘 내 마음은...
          </h3>

          <div className={`${card} px-5 py-4`}>
            <div className="flex items-center justify-between">
              {MOODS.map((m) => {
                const active = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    className={[
                      'h-11 w-11 rounded-full flex items-center justify-center',
                      'text-[28px] leading-none transition',
                      active
                        ? 'ring-2 ring-[#795549]/60 bg-[#F5F0E5]'
                        : 'bg-transparent',
                    ].join(' ')}
                    aria-label={m.label}
                  >
                    <span aria-hidden>{m.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* routine score */}
        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            오늘 루틴 이행 정도는 어땠나요?
          </h3>

          <div className={`${card} px-5 py-4`}>
            <div className="relative pt-3 pb-7">
              <div className="relative h-10">
                <div className="absolute left-0 right-0 top-5 h-[2px] bg-[#795549]/30 rounded-full" />

                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-[14px] h-6 w-[2px] bg-[#795549]/35"
                    style={{
                      left: `${(i / 4) * 100}%`,
                      transform: 'translateX(-1px)',
                    }}
                  />
                ))}

                <div
                  className="absolute top-[16px] h-4 w-4 rounded-full bg-[#795549] pointer-events-none"
                  style={{
                    left: `${(routineScore / 4) * 100}%`,
                    transform: 'translate(-50%, 0)',
                  }}
                />

                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={routineScore}
                  onChange={(e) => setRoutineScore(Number(e.target.value))}
                  className="absolute left-0 top-3 w-full h-10 opacity-0 cursor-pointer"
                  aria-label="루틴 이행 정도 선택"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#DBA67A]">
                {SCALE_LABELS.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* routines */}
        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            오늘 실행한 루틴
          </h3>

          <div className="space-y-3">
            {ROUTINES.map((r, idx) => (
              <label
                key={r.id}
                className={[
                  card,
                  'px-4 py-3 flex items-center gap-3 cursor-pointer select-none',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#795549]/40 accent-[#795549]"
                  checked={!!checked[idx]}
                  onChange={(e) =>
                    setChecked((prev) => ({ ...prev, [idx]: e.target.checked }))
                  }
                />
                <span className="text-[13px] font-medium text-[#795549]">
                  {r.title} - {r.subtitle}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* note */}
        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            오늘 나에게 한 마디
          </h3>

          <div className={`${card} px-4 py-4`}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="오늘 내가 해낸 것 중 가장 괜찮았거나 잘안 된 것은..."
              className={[
                'w-full min-h-[90px] resize-none bg-transparent',
                'text-[13px] font-medium text-[#795549]',
                'placeholder:text-[#DBA67A]',
                'outline-none',
              ].join(' ')}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="w-full mt-4">
          <PrimaryPillButton
            className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
            onClick={handleSubmit}
          >
            <span aria-hidden>🎁</span>
            <span>나를 위한 선물 보러가기/저장 →</span>
          </PrimaryPillButton>

          <p className="text-center text-[12px] text-[#795549]/70 mt-2">
            작은 실행들이 모여 큰 변화를 만들어냅니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ReportPage;
