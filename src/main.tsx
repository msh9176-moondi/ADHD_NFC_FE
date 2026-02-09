import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import './index.css';
import App from './App.tsx';
import LoginPage from './pages/auth/Login.tsx';
import SignupPage from './pages/auth/Signup.tsx';
import SplashPage from './pages/auth/Splash.tsx';
import ForgotPasswordPage from './pages/auth/ForgotPassword.tsx';
import ResetPasswordPage from './pages/auth/ResetPassword.tsx';
import { KakaoCallbackPage, GoogleCallbackPage, NaverCallbackPage } from './pages/auth/SocialCallback.tsx';
import GrowthPage from './pages/growth/Growth.tsx';
import MarketPage from './pages/market/Market.tsx';
import CartpagePage from './pages/market/order/Cartpage.tsx';
import CheckoutPage from './pages/market/order/Checkout.tsx';
import CheckoutSuccessPage from './pages/market/order/CheckoutSuccess.tsx';
import BranchingTestPage from './pages/market/test/BranchingTest.tsx';
import ComplexTypePage from './pages/market/test/branching questions/ComplexType.tsx';
import EmotionalTypePage from './pages/market/test/branching questions/EmotionalType.tsx';
import EnvironmentTypePage from './pages/market/test/branching questions/EnvironmentType.tsx';
import ImpulsiveTypePage from './pages/market/test/branching questions/ImpulsiveType.tsx';
import MotivationalTypePage from './pages/market/test/branching questions/MotivationalType.tsx';
import ProfilePAge from './pages/profile/Profile.tsx';
import TypeReportPage from './pages/profile/TypeReportPage.tsx';
import AiAnalysisPage from './pages/profile/anlysis/AiAnalysis.tsx';
import ExpertAnalysisPage from './pages/profile/anlysis/ExpertAnalysis.tsx';
import ExpertProfilePage from './pages/profile/anlysis/ExpertProfile.tsx';
import ReportPage from './pages/report/Report.tsx';
import RewardPage from './pages/reward/reward.tsx';
import AttentionTypePage from './pages/market/test/branching questions/AttentionType.tsx';
import RootLayout from './pages/layout.tsx';
import AuthLayout from './pages/AuthLayout.tsx';
import ComingSoonPage from './pages/common/ComingSoon.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboard.tsx';
import AdminUsersPage from './pages/admin/AdminUsers.tsx';
import AdminProductsPage from './pages/admin/AdminProducts.tsx';
import AdminRoutinesPage from './pages/admin/AdminRoutines.tsx';

// 인증 초기화 컴포넌트
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer>
      <Routes>
        {/* ✅ Auth: 헤더/푸터 없이 */}
        <Route element={<AuthLayout />}>
          {/* 메인(첫 화면)을 Splash로 */}
          <Route path="/" element={<SplashPage />} />

          <Route path="auth/splash" element={<SplashPage />} />
          <Route path="auth/splash/login" element={<LoginPage />} />
          <Route path="auth/splash/signup" element={<SignupPage />} />
          <Route
            path="auth/splash/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route path="auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/kakao/callback" element={<KakaoCallbackPage />} />
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="auth/naver/callback" element={<NaverCallbackPage />} />
        </Route>

        {/* ✅ App: 헤더/푸터 있는 영역 */}
        <Route element={<RootLayout />}>
          {/* 로그인 이후 홈을 App으로 유지하고 싶으면 /home 같은 별도 path 추천 */}
          <Route path="home" element={<App />} />

          {/* profile */}
          <Route path="profile" element={<ProfilePAge />} />
          <Route path="profile/recharge" element={<ProfilePAge />} />
          <Route path="profile/type/:type" element={<TypeReportPage />} />

          {/* Growth */}
          <Route path="growth" element={<GrowthPage />} />

          {/* Market */}
          <Route path="market" element={<MarketPage />} />

          {/* Order */}
          <Route path="market/order/cartpage" element={<CartpagePage />} />
          <Route path="market/order/checkout" element={<CheckoutPage />} />
          <Route
            path="market/order/checkoutsuccess"
            element={<CheckoutSuccessPage />}
          />

          {/* test */}
          <Route
            path="market/test/branchingtest"
            element={<BranchingTestPage />}
          />
          <Route
            path="market/test/branchingtest/attention"
            element={<AttentionTypePage />}
          />
          <Route
            path="market/test/branchingtest/complex"
            element={<ComplexTypePage />}
          />
          <Route
            path="market/test/branchingtest/emotional"
            element={<EmotionalTypePage />}
          />
          <Route
            path="market/test/branchingtest/environment"
            element={<EnvironmentTypePage />}
          />
          <Route
            path="market/test/branchingtest/impulsive"
            element={<ImpulsiveTypePage />}
          />
          <Route
            path="market/test/branchingtest/motivation"
            element={<MotivationalTypePage />}
          />

          {/* analysis */}
          <Route path="profile/ai/anlysis" element={<AiAnalysisPage />} />
          <Route path="profile/report/monthly" element={<AiAnalysisPage />} />
          <Route
            path="profile/expert/anlysis"
            element={<ExpertAnalysisPage />}
          />
          <Route path="profile/expert" element={<ExpertProfilePage />} />

          {/* Report */}
          <Route path="report" element={<ReportPage />} />

          {/* Reward */}
          <Route path="reward" element={<RewardPage />} />

          {/* Coming Soon */}
          <Route path="coming-soon/expert-report" element={<ComingSoonPage />} />
          <Route path="coming-soon/hospital" element={<ComingSoonPage />} />
        </Route>

        {/* ✅ Admin: 관리자 패널 (ADMIN 권한 필요) */}
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/routines" element={<AdminRoutinesPage />} />
        </Route>
      </Routes>
      </AuthInitializer>
    </BrowserRouter>
  </StrictMode>,
);
