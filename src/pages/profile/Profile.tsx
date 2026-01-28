import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PrimaryPillButton } from "@/components/common/PillButton";
import { useProgressStore, useGrowthStore } from "@/store";
import { useTraitsStore, type TraitKey } from "@/store/traits";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const ROUTINES_META = [
  {
    id: "water",
    title: "물 마시기",
    subtitle: "몸에게 주는 작은 선물",
    emoji: "💧",
  },
  {
    id: "clean",
    title: "청소하기",
    subtitle: "마음도 함께 정돈돼요",
    emoji: "🧹",
  },
  { id: "walk", title: "걷기", subtitle: "생각이 맑아지는 시간", emoji: "🚶" },
  {
    id: "meditate",
    title: "명상하기",
    subtitle: "잠시 멈춤의 여유",
    emoji: "🧘",
  },
  {
    id: "plan",
    title: "계획 세우기",
    subtitle: "내일을 위한 준비",
    emoji: "📝",
  },
] as const;

const MOODS = [
  { key: "excited", label: "기쁨", emoji: "🤩" },
  { key: "calm", label: "평온", emoji: "😊" },
  { key: "sleepy", label: "피곤", emoji: "😴" },
  { key: "tired", label: "무기력", emoji: "😣" },
  { key: "angry", label: "짜증", emoji: "😡" },
] as const;

const chartConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
  value: { label: "Value", color: "var(--chart-1)" },
} satisfies ChartConfig;

function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("floca_avatar");
    if (saved) setAvatar(saved);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      localStorage.setItem("floca_avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const navigate = useNavigate();

  // progress store (나무 레벨, XP)
  const { level, xp: xpTotal, syncFromBackend: syncTree } = useProgressStore();

  // growth store (통계 데이터 - 백엔드 연동)
  const {
    routineRanking: apiRoutineRanking,
    totalExecutions,
    totalDays: dayCount,
    moodLogs,
    fetchAll: fetchStats,
  } = useGrowthStore();

  // 페이지 로드 시 백엔드에서 데이터 가져오기 (항상 최신 데이터 fetch)
  useEffect(() => {
    console.log("[Profile] 페이지 마운트 - 데이터 fetch 시작");
    syncTree();
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 백엔드 루틴 랭킹을 ROUTINES_META와 매핑 (원래 순서 유지)
  const routinesWithCount = useMemo(() => {
    console.log("[Profile] apiRoutineRanking 데이터:", apiRoutineRanking);
    const result = ROUTINES_META.map((r) => {
      const apiData = apiRoutineRanking.find((ar) => ar.routineId === r.id);
      return { ...r, count: apiData?.count ?? 0 };
    });
    console.log("[Profile] 루틴 실행 현황:", result);
    return result;
  }, [apiRoutineRanking]);

  // mood logs (이번 달) - 백엔드 데이터 사용
  const moodStats = useMemo(() => {
    console.log("[Profile] moodLogs 데이터:", moodLogs);
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const monthLogs = moodLogs.filter((l) => {
      const d = new Date(l.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });

    console.log("[Profile] 이번 달 감정 기록:", monthLogs);

    const total = monthLogs.length || 1;
    const countsByMood: Record<string, number> = {};
    for (const item of monthLogs)
      countsByMood[item.mood] = (countsByMood[item.mood] ?? 0) + 1;

    const data = MOODS.map((mm) => {
      const c = countsByMood[mm.key] ?? 0;
      const pct = Math.round((c / total) * 100);
      return { key: mm.key, label: mm.label, emoji: mm.emoji, value: pct };
    });

    console.log("[Profile] 감정 통계:", data);
    return { data, totalLogs: monthLogs.length };
  }, [moodLogs]);

  // 성향 점수 (백엔드 연동)
  const { scores, hasAnyScore, fetchTraits } = useTraitsStore();

  // 페이지 로드 시 성향 점수 가져오기 (항상 최신 데이터 fetch)
  useEffect(() => {
    console.log('[Profile] fetchTraits 호출');
    fetchTraits();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const taken = hasAnyScore();

  const radarData = useMemo(() => {
    return [
      { axis: "집중", score: scores?.attention ?? 0 },
      { axis: "충동", score: scores?.impulsive ?? 0 },
      { axis: "복합", score: scores?.complex ?? 0 },
      { axis: "감정", score: scores?.emotional ?? 0 },
      { axis: "동기", score: scores?.motivation ?? 0 },
      { axis: "환경", score: scores?.environment ?? 0 },
    ];
  }, [scores]);

  const topTrait = useMemo<TraitKey | null>(() => {
    if (!taken || !scores) return null;
    const entries: Array<[TraitKey, number]> = [
      ["attention", scores.attention ?? 0],
      ["impulsive", scores.impulsive ?? 0],
      ["complex", scores.complex ?? 0],
      ["emotional", scores.emotional ?? 0],
      ["motivation", scores.motivation ?? 0],
      ["environment", scores.environment ?? 0],
    ];
    const max = Math.max(...entries.map(([, v]) => v));
    if (max <= 0) return null;
    return entries.find(([, v]) => v === max)?.[0] ?? null;
  }, [taken, scores]);

  const traitTitle = useMemo(() => {
    if (!taken || !topTrait) return "이번 달 당신의 ADHD 성향";
    const map: Record<TraitKey, string> = {
      attention: "집중형",
      impulsive: "충동형",
      complex: "복합형",
      emotional: "감정형",
      motivation: "동기형",
      environment: "환경형",
    };
    return `이번 달 당신의 ADHD 성향 · ${map[topTrait]}`;
  }, [taken, topTrait]);

  const cardSoft = "bg-[#F5F0E5] rounded-2xl p-5 text-center";

  return (
    <div className="w-full px-4 ">
      <div className="max-w-md mx-auto">
        {/* 상단 프로필 */}
        <div className="pt-8 flex flex-col items-center">
          {/* 아바타(클릭 = 사진 변경) */}
          <label className="cursor-pointe flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[#D9A77F] flex items-center justify-center overflow-hidden transition hover:opacity-90 hover:scale-[1.02]">
              {avatar ? (
                <img
                  src={avatar}
                  alt="프로필 사진"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[60px]" aria-hidden>
                  👤
                </span>
              )}
            </div>

            {/* hidden input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-[12px] text-[#795549]/70 mt-1 cursor-pointer">
              프로필 사진 변경
            </p>
          </label>

          <div className="w-full border-t border-[#DBA67A]/60 mt-6" />

          <div className="w-full mt-4">
            <h2 className="text-[14px] font-semibold text-[#795549]">
              나의 성장 여정
            </h2>
            <p className="text-[12px] text-[#795549]/70 mt-1">
              당신만의 특별한 이야기가 쌓여가고 있어요
            </p>
          </div>
        </div>

        {/* 요약 2x2 */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className={cardSoft}>
            <div className="text-[26px] mb-2" aria-hidden>
              🌳
            </div>
            <div className="text-[20px] font-bold text-[#795549]">{level}</div>
            <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
              나무 레벨
            </div>
          </div>

          <div className={cardSoft}>
            <div className="text-[26px] mb-2" aria-hidden>
              👍
            </div>
            <div className="text-[20px] font-bold text-[#795549]">
              {totalExecutions}
            </div>
            <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
              보상 루틴(실천하기)
            </div>
          </div>

          <div className={cardSoft}>
            <div className="text-[28px] font-extrabold text-[#795549] mb-2">
              XP
            </div>
            <div className="text-[20px] font-bold text-[#795549]">
              {xpTotal}
            </div>
            <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
              총 경험치
            </div>
          </div>

          <div className={cardSoft}>
            <div className="text-[28px] font-extrabold text-[#795549] mb-2">
              DAY
            </div>
            <div className="text-[20px] font-bold text-[#795549]">
              {dayCount}
            </div>
            <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
              사용 일수
            </div>
          </div>
        </section>

        {/* 이번 달 감정 여행 (막대 그래프) */}
        <section className="mt-8">
          <h3 className="text-[13px] font-semibold text-[#795549] mb-3">
            이번 달 감정 여행
          </h3>

          <Card className="p-4 rounded-2xl shadow-sm">
            <div className="h-40">
              {moodStats.totalLogs === 0 ? (
                <div className="h-full flex items-center justify-center text-[12px] text-[#795549]/70">
                  아직 감정 기록이 없어요. Report에서 기록하면 그래프가 생겨요.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodStats.data}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis hide domain={[0, 100]} />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      fill="#DBA67A" // ✅ 막대 색
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 범례 */}
            <div className="-mt-8 flex items-center justify-center gap-10.5">
              {moodStats.data.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <span className="text-[18px]" aria-hidden>
                    {d.emoji}
                  </span>
                  <span className="text-[11px] font-semibold text-[#795549]">
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ADHD 성향 레이더 */}
        <section className="mt-8">
          <h3 className="text-[13px] font-semibold text-[#795549] mb-3">
            {traitTitle}
          </h3>

          <Card className="p-4 rounded-2xl shadow-sm">
            {!taken ? (
              <div className="text-[12px] text-[#795549]/70">
                아직 성향 테스트 데이터가 없어요. 테스트를 완료하면 레이더가
                채워져요.
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="w-full h-65 min-h-65"
              >
                <RadarChart
                  data={radarData}
                  outerRadius={80}
                  width={320}
                  height={240}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey="score"
                    fill="#DBA67A"
                    stroke="#DBA67A"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ChartContainer>
            )}
          </Card>
        </section>

        {/* 문장/피드백 블록 (더미) */}
        <section className="mt-8">
          <h3 className="text-[13px] font-semibold text-[#795549] mb-2">
            종합한 루틴 데이터
          </h3>
          <p className="text-[12px] text-[#795549]/80 leading-relaxed">
            기록이 쌓일수록 당신의 패턴이 더 선명해져요. <br />
            “어떤 날에 잘 되는지 / 막히는지”를 FLOCA가 더 정확히 도와줄 수
            있어요.
          </p>

          <h3 className="text-[13px] font-semibold text-[#795549] mt-6 mb-2">
            ADHD에 특화된 루틴 실행 현황
          </h3>
          <div className="space-y-2">
            {routinesWithCount.map((r, idx) => (
              <div key={r.id} className="text-[12px] text-[#795549]/80">
                {idx + 1}.{" "}
                <span className="font-semibold text-[#795549]">{r.title}</span>{" "}
                <span className="text-[#795549]/70">({r.count}회)</span>
                <div className="text-[#795549]/60">{r.subtitle}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ADHD 케어 서비스 */}
        <section className="mt-10">
          <h3 className="text-[13px] font-semibold text-[#795549] mb-3">
            ADHD 케어 서비스
          </h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/care/ai")}
              className="w-full text-left bg-[#8B6A5A] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">
                    이번달 당신의 ADHD 패턴 리포트
                  </div>
                  <div className="text-[12px] text-white/80">
                    감정·루틴 데이터를 기반으로 요약 분석
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/care/expert")}
              className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-[#DBA67A]/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F0E5] flex items-center justify-center">
                  <span aria-hidden className="text-[20px]">
                    👨‍⚕️
                  </span>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#795549]">
                    전문가 분석 기반 ADHD 패턴 리포트
                  </div>
                  <div className="text-[12px] text-[#795549]/70">
                    상담용 요약 / 실천 가이드 제공
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ADHD 파트너스 */}
        <section className="mt-10">
          <h3 className="text-[13px] font-semibold text-[#795549] mb-3">
            ADHD 파트너스
          </h3>

          <div className="space-y-3">
            {[
              {
                title: "ADHD 학습 자료",
                desc: "ADHD에 강한 학습 이해법",
                icon: "📝",
                to: "https://blog.naver.com/msh4688",
              },
              {
                title: "ADHD 커뮤니티",
                desc: "리포트 공유, 동료와 함께",
                icon: "👥",
                to: "https://open.kakao.com/o/gOW56u7h",
              },
              {
                title: "병원 연계 서비스",
                desc: "FLOCA와 함께하는 진단·상담",
                icon: "🏥",
                to: "/partners/clinic",
              },
            ].map((it) => (
              <button
                key={it.title}
                type="button"
                onClick={() => {
                  if (it.to.startsWith("http")) {
                    window.open(it.to, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(it.to);
                  }
                }}
                className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-[#DBA67A]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F0E5] flex items-center justify-center">
                      <span aria-hidden>{it.icon}</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#795549]">
                        {it.title}
                      </div>
                      <div className="text-[12px] text-[#795549]/70">
                        {it.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[#795549]/60" aria-hidden>
                    ›
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 하단 문구 + CTA */}
        <section className="mt-10">
          <div className="border-t border-[#DBA67A]/60 pt-6 text-center">
            <h4 className="text-[14px] font-semibold text-[#795549]">
              정말 잘하고 있어요!
            </h4>
            <p className="text-[12px] text-[#795549]/70 mt-2">
              매일의 작은 실천이 모여 지금의 성장을 만들었어요.
              <br />
              앞으로도 당신만의 속도로 천천히 나아가요.
            </p>
          </div>

          <div className="mt-6">
            <PrimaryPillButton
              className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
              onClick={() => navigate("/report")}
            >
              <span aria-hidden>✏️</span>
              <span>기록하러 가기 →</span>
            </PrimaryPillButton>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
