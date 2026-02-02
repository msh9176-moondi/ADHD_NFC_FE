import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { useReportStore, useGrowthStore, useProgressStore } from '@/store';
import { ROUTINES_META, MOODS_REPORT, type MoodKey } from '@/constants';

const SCALE_LABELS = [
  '거의 못함',
  '조금 함',
  '절반 정도',
  '대부분 함',
  '거의 다함',
];

function ReportPage() {
  const navigate = useNavigate();

  // 백엔드 스토어
  const { saveDailyLog, isLoading } = useReportStore();
  const { fetchAll: refreshGrowthData } = useGrowthStore();
  const { syncFromBackend: refreshTreeData } = useProgressStore();

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

  const handleSubmit = async () => {
    // 체크된 루틴 id 추출
    const completedRoutineIds = ROUTINES_META.map((r, idx) =>
      checked[idx] ? r.id : null,
    ).filter(Boolean) as string[];

    console.log('[Report] 저장 시작:', {
      mood,
      routineScore,
      completedRoutineIds,
    });

    try {
      // 1) 백엔드에 일일 리포트 저장
      const savedLog = await saveDailyLog({
        mood,
        routineScore,
        completedRoutines: completedRoutineIds,
        note: note || undefined,
      });
      console.log('[Report] 저장 완료:', savedLog);

      // 2) 백엔드 데이터 리프레시 (Growth, Profile 탭에 반영)
      console.log('[Report] 데이터 리프레시 시작');
      await Promise.all([refreshGrowthData(), refreshTreeData()]);
      console.log('[Report] 데이터 리프레시 완료');

      // 저장 완료 알림
      alert('오늘의 기록이 저장되었습니다!');
    } catch (error) {
      console.error('[Report] 리포트 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="w-full px-4">
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
              {MOODS_REPORT.map((m) => {
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
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-[#795549]/30 rounded-full" />

                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-3.5 h-6 w-0.5 bg-[#795549]/35"
                    style={{
                      left: `${(i / 4) * 100}%`,
                      transform: 'translateX(-1px)',
                    }}
                  />
                ))}

                <div
                  className="absolute top-4 h-4 w-4 rounded-full bg-[#795549] pointer-events-none"
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
            {ROUTINES_META.map((r, idx) => (
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
                'w-full min-h-22.5 resize-none bg-transparent',
                'text-[13px] font-medium text-[#795549]',
                'placeholder:text-[#DBA67A]',
                'outline-none',
              ].join(' ')}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="w-full mt-4 space-y-3">
          <PrimaryPillButton
            className="w-full text-[13px] font-semibold flex items-center justify-center py-4"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </PrimaryPillButton>

          <PrimaryPillButton
            className="w-full text-[13px] font-semibold flex items-center justify-center gap-2 py-4"
            onClick={() => navigate('/market')}
          >
            <span aria-hidden>🎁</span>
            <span>나를 위한 선물 보러가기 →</span>
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
