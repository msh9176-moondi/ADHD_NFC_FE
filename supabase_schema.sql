-- =====================================================
-- ADHD NFC 프로젝트 - Supabase 데이터베이스 스키마
-- =====================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM 타입 생성
-- =====================================================

-- 사용자 역할
CREATE TYPE role_enum AS ENUM ('user', 'admin', 'expert', 'seller');

-- 소셜 로그인 제공자
CREATE TYPE social_provider_enum AS ENUM ('google', 'kakao', 'naver');

-- 약관 유형
CREATE TYPE agreement_type_enum AS ENUM (
  'terms_of_service',
  'privacy_policy',
  'marketing',
  'purchase_agreement',
  'purchase_privacy',
  'purchase_third_party'
);

-- 코인 거래 유형
CREATE TYPE coin_transaction_type_enum AS ENUM (
  'earn',
  'use',
  'expire',
  'admin_grant',
  'admin_deduct'
);

-- 상품 카테고리
CREATE TYPE product_category_enum AS ENUM ('focus', 'wellness', 'lifestyle');

-- ADHD 성향 유형
CREATE TYPE trait_type_enum AS ENUM (
  'attention',
  'impulsive',
  'complex',
  'emotional',
  'motivation',
  'environment'
);

-- =====================================================
-- 테이블 생성
-- =====================================================

-- 1. 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_number VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password VARCHAR,
  nickname VARCHAR,
  profile_image VARCHAR,
  role role_enum DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_login_at TIMESTAMPTZ,
  password_reset_token VARCHAR,
  password_reset_expires TIMESTAMPTZ,
  refresh_token VARCHAR,
  refresh_token_expires TIMESTAMPTZ,
  real_name VARCHAR,
  phone VARCHAR,
  zip_code VARCHAR,
  address VARCHAR,
  address_detail VARCHAR,
  delivery_request VARCHAR,
  coin_balance INT DEFAULT 0 NOT NULL,
  xp INT DEFAULT 0 NOT NULL,
  total_tag_count INT DEFAULT 0 NOT NULL,
  planner_number VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. 소셜 계정 테이블
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider social_provider_enum NOT NULL,
  provider_id VARCHAR NOT NULL,
  access_token VARCHAR,
  refresh_token VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(provider, provider_id)
);

-- 3. 약관 동의 이력 테이블
CREATE TABLE user_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type agreement_type_enum NOT NULL,
  is_agreed BOOLEAN NOT NULL,
  agreed_at TIMESTAMPTZ NOT NULL,
  agreement_version VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. NFC 카드 테이블
CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_uid VARCHAR(32) UNIQUE NOT NULL,
  card_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_used_at TIMESTAMPTZ,
  total_tag_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. 코인 거래 이력 테이블
CREATE TABLE coin_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type coin_transaction_type_enum NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  description VARCHAR,
  reference_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. 일일 기록 테이블
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(20) NOT NULL,
  routine_score INT DEFAULT 0 NOT NULL,
  completed_routines JSONB,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- 7. ADHD 성향 점수 테이블
CREATE TABLE trait_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attention INT DEFAULT 0 NOT NULL,
  impulsive INT DEFAULT 0 NOT NULL,
  complex INT DEFAULT 0 NOT NULL,
  emotional INT DEFAULT 0 NOT NULL,
  motivation INT DEFAULT 0 NOT NULL,
  environment INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. 상품 테이블
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  category product_category_enum DEFAULT 'lifestyle' NOT NULL,
  recommended_trait trait_type_enum,
  is_available BOOLEAN DEFAULT true NOT NULL,
  is_coming_soon BOOLEAN DEFAULT false NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. AI 월간 리포트 테이블
CREATE TABLE ai_monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  year_month VARCHAR(7) NOT NULL,
  summary_json JSONB,
  detail_json JSONB,
  stats_json JSONB,
  model VARCHAR(50),
  prompt_version VARCHAR(20),
  regenerate_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, year_month)
);

-- =====================================================
-- 인덱스 생성
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_number ON users(user_number);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider, provider_id);
CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX idx_nfc_cards_user_id ON nfc_cards(user_id);
CREATE INDEX idx_nfc_cards_card_uid ON nfc_cards(card_uid);
CREATE INDEX idx_coin_history_user_id ON coin_history(user_id);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(user_id, date);
CREATE INDEX idx_trait_scores_user_id ON trait_scores(user_id);
CREATE INDEX idx_ai_monthly_reports_user_id ON ai_monthly_reports(user_id);
CREATE INDEX idx_ai_monthly_reports_year_month ON ai_monthly_reports(user_id, year_month);

-- =====================================================
-- updated_at 자동 업데이트 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agreements_updated_at BEFORE UPDATE ON user_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfc_cards_updated_at BEFORE UPDATE ON nfc_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coin_history_updated_at BEFORE UPDATE ON coin_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trait_scores_updated_at BEFORE UPDATE ON trait_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_monthly_reports_updated_at BEFORE UPDATE ON ai_monthly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) 활성화
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_monthly_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS 정책 (사용자는 자신의 데이터만 접근)
-- =====================================================

-- Users: 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Social Accounts
CREATE POLICY "Users can view own social accounts" ON social_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own social accounts" ON social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- User Agreements
CREATE POLICY "Users can view own agreements" ON user_agreements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agreements" ON user_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NFC Cards
CREATE POLICY "Users can view own nfc cards" ON nfc_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nfc cards" ON nfc_cards
  FOR ALL USING (auth.uid() = user_id);

-- Coin History
CREATE POLICY "Users can view own coin history" ON coin_history
  FOR SELECT USING (auth.uid() = user_id);

-- Daily Logs
CREATE POLICY "Users can view own daily logs" ON daily_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Trait Scores
CREATE POLICY "Users can view own trait scores" ON trait_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trait scores" ON trait_scores
  FOR ALL USING (auth.uid() = user_id);

-- Products: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT USING (is_available = true);

-- AI Monthly Reports
CREATE POLICY "Users can view own reports" ON ai_monthly_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports" ON ai_monthly_reports
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 샘플 상품 데이터 삽입
-- =====================================================

INSERT INTO products (name, description, image_url, price, category, recommended_trait, is_available, sort_order) VALUES
('집중력 타이머', 'ADHD를 위한 시각적 타이머. 남은 시간을 직관적으로 확인할 수 있습니다.', '/images/products/timer.png', 100, 'focus', 'attention', true, 1),
('감정 다이어리', '하루의 감정을 기록하고 패턴을 분석하는 다이어리입니다.', '/images/products/diary.png', 80, 'wellness', 'emotional', true, 2),
('루틴 체크리스트', '일상 루틴을 체계적으로 관리할 수 있는 체크리스트입니다.', '/images/products/checklist.png', 60, 'lifestyle', 'motivation', true, 3),
('화이트노이즈 기기', '집중력 향상을 위한 백색소음 발생 기기입니다.', '/images/products/whitenoise.png', 150, 'focus', 'environment', true, 4),
('스트레스볼', '충동 조절에 도움이 되는 스트레스 해소 볼입니다.', '/images/products/stressball.png', 30, 'wellness', 'impulsive', true, 5);
