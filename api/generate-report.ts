import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서버용)
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 타입 정의
interface DailyLog {
  mood: string;
  routine_score: number;
  completed_routines: string[] | null;
  note: string | null;
  date: string;
}

interface ReportSummary {
  emotion_execution: string;
  recovery: string;
  language_shift: string;
  retention: string;
  next_strategy: string;
}

interface ReportDetailSection {
  text: string;
  actions: string[];
}

interface ReportDetail {
  emotion_execution: ReportDetailSection;
  recovery: ReportDetailSection;
  language_shift: ReportDetailSection;
  retention: ReportDetailSection;
  next_strategy: ReportDetailSection;
}

// 감정 한글 매핑
const MOOD_LABEL: Record<string, string> = {
  excited: '신남',
  calm: '평온',
  sleepy: '졸림',
  tired: '무기력',
  angry: '짜증',
  anxiety: '불안',
  joy: '기쁨',
  neutral: '보통',
};

// AI 프롬프트 생성
function generatePrompt(logs: DailyLog[], yearMonth: string): string {
  const moodSummary = logs.reduce((acc, log) => {
    const label = MOOD_LABEL[log.mood] || log.mood;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgScore = logs.length > 0
    ? Math.round(logs.reduce((sum, log) => sum + (log.routine_score || 0), 0) / logs.length)
    : 0;

  const notes = logs
    .filter(log => log.note)
    .map(log => `- ${log.date}: ${log.note}`)
    .join('\n');

  return `당신은 ADHD 전문 심리상담사입니다. 아래 사용자의 ${yearMonth} 한 달간 기록을 분석하여 ADHD 패턴 리포트를 작성해주세요.

## 기록 요약
- 총 기록 일수: ${logs.length}일
- 평균 루틴 이행률: ${avgScore}%
- 감정 분포: ${Object.entries(moodSummary).map(([mood, count]) => `${mood}(${count}일)`).join(', ')}

## 사용자 메모
${notes || '(메모 없음)'}

## 요청사항
아래 JSON 형식으로 응답해주세요. 각 섹션은 ADHD 특성을 고려하여 따뜻하고 공감적인 톤으로 작성해주세요.

{
  "summary": {
    "emotion_execution": "감정과 실행력의 연결 패턴에 대한 1-2문장 요약",
    "recovery": "힘든 날 이후 회복하는 패턴에 대한 1-2문장 요약",
    "language_shift": "자기 대화나 표현 방식의 변화에 대한 1-2문장 요약",
    "retention": "루틴 유지력에 대한 1-2문장 요약",
    "next_strategy": "다음 달을 위한 전략 제안 1-2문장"
  },
  "detail": {
    "emotion_execution": {
      "text": "감정과 실행력 연결에 대한 상세 분석 (3-4문장)",
      "actions": ["구체적인 실천 방법 1", "구체적인 실천 방법 2"]
    },
    "recovery": {
      "text": "회복 패턴에 대한 상세 분석 (3-4문장)",
      "actions": ["구체적인 실천 방법 1", "구체적인 실천 방법 2"]
    },
    "language_shift": {
      "text": "언어/표현 변화에 대한 상세 분석 (3-4문장)",
      "actions": ["구체적인 실천 방법 1", "구체적인 실천 방법 2"]
    },
    "retention": {
      "text": "루틴 유지력에 대한 상세 분석 (3-4문장)",
      "actions": ["구체적인 실천 방법 1", "구체적인 실천 방법 2"]
    },
    "next_strategy": {
      "text": "다음 달 전략에 대한 상세 설명 (3-4문장)",
      "actions": ["구체적인 실천 방법 1", "구체적인 실천 방법 2"]
    }
  }
}

중요: 반드시 위 JSON 형식만 출력하세요. 다른 텍스트는 포함하지 마세요.`;
}

// OpenAI API 호출
async function callOpenAI(prompt: string): Promise<{ summary: ReportSummary; detail: ReportDetail }> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 ADHD 전문 심리상담사입니다. 따뜻하고 공감적인 톤으로 분석합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 오류: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI 응답이 비어있습니다.');
  }

  // JSON 파싱
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON 형식의 응답을 파싱할 수 없습니다.');
  }

  return JSON.parse(jsonMatch[0]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 환경변수 체크
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API 키가 설정되지 않았습니다.' });
    }

    if (!supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase 서비스 키가 설정되지 않았습니다.' });
    }

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const token = authHeader.substring(7);

    // 토큰 검증 및 사용자 정보 추출
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const { yearMonth } = req.body;
    if (!yearMonth) {
      return res.status(400).json({ error: 'yearMonth가 필요합니다.' });
    }

    // 해당 월의 daily_logs 조회
    const startOfMonth = `${yearMonth}-01`;
    const [year, month] = yearMonth.split('-').map(Number);
    const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('daily_logs')
      .select('mood, routine_score, completed_routines, note, date')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: true });

    if (logsError) {
      throw new Error(`기록 조회 실패: ${logsError.message}`);
    }

    if (!logs || logs.length < 3) {
      return res.status(400).json({
        error: '분석을 위해 최소 3일 이상의 기록이 필요합니다.',
        recordDays: logs?.length || 0,
      });
    }

    // 기존 리포트 확인 (재생성 횟수 체크)
    const { data: existingReport } = await supabaseAdmin
      .from('ai_monthly_reports')
      .select('id, regenerate_count')
      .eq('user_id', user.id)
      .eq('year_month', yearMonth)
      .single();

    const regenerateCount = existingReport?.regenerate_count || 0;
    if (regenerateCount >= 3) {
      return res.status(400).json({ error: '이번 달 재생성 횟수를 모두 사용했습니다.' });
    }

    // OpenAI로 분석 요청
    const prompt = generatePrompt(logs, yearMonth);
    const { summary, detail } = await callOpenAI(prompt);

    // 리포트 저장/업데이트
    const reportData = {
      user_id: user.id,
      year_month: yearMonth,
      summary_json: summary,
      detail_json: detail,
      model: 'gpt-4o-mini',
      prompt_version: 'v1',
      regenerate_count: regenerateCount + 1,
    };

    let savedReport;
    if (existingReport) {
      // 업데이트
      const { data, error } = await supabaseAdmin
        .from('ai_monthly_reports')
        .update(reportData)
        .eq('id', existingReport.id)
        .select()
        .single();

      if (error) throw new Error(`리포트 업데이트 실패: ${error.message}`);
      savedReport = data;
    } else {
      // 새로 생성
      const { data, error } = await supabaseAdmin
        .from('ai_monthly_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw new Error(`리포트 저장 실패: ${error.message}`);
      savedReport = data;
    }

    return res.status(200).json({
      success: true,
      report: {
        id: savedReport.id,
        yearMonth: savedReport.year_month,
        summary: savedReport.summary_json,
        detail: savedReport.detail_json,
        model: savedReport.model,
        regenerateRemaining: Math.max(0, 3 - savedReport.regenerate_count),
        createdAt: savedReport.created_at,
        updatedAt: savedReport.updated_at,
      },
    });
  } catch (error: any) {
    console.error('리포트 생성 오류:', error);
    return res.status(500).json({ error: error.message || '리포트 생성에 실패했습니다.' });
  }
}
