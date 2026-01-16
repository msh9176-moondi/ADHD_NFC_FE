import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import LoginPage from "./pages/auth/Login.tsx";
import SignupPage from "./pages/auth/Signup.tsx";
import SplashPage from "./pages/auth/Splash.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPassword.tsx";
import GrowthPage from "./pages/growth/Growth.tsx";
import MarketPage from "./pages/market/Market.tsx";
import CartpagePage from "./pages/market/order/Cartpage.tsx";
import CheckoutPage from "./pages/market/order/Checkout.tsx";
import CheckoutSuccessPage from "./pages/market/order/CheckoutSuccess.tsx";
import BranchingTestPage from "./pages/market/test/BranchingTest.tsx";
import ComplexTypePage from "./pages/market/test/branching questions/ComplexType.tsx";
import EmotionalTypePage from "./pages/market/test/branching questions/EmotionalType.tsx";
import EnvironmentTypePage from "./pages/market/test/branching questions/EnvironmentType.tsx";
import ImpulsiveTypePage from "./pages/market/test/branching questions/ImpulsiveType.tsx";
import MotivationalTypePage from "./pages/market/test/branching questions/MotivationalType.tsx";
import ProfilePAge from "./pages/profile/Profile.tsx";
import AiAnalysisPage from "./pages/profile/anlysis/AiAnalysis.tsx";
import ExpertAnalysisPage from "./pages/profile/anlysis/ExpertAnalysis.tsx";
import ExpertProfilePage from "./pages/profile/anlysis/ExpertProfile.tsx";
import ReportPage from "./pages/report/Report.tsx";
import RewardPage from "./pages/reward/reward.tsx";
import AttentionTypePage from "./pages/market/test/branching questions/AttentionType.tsx";
import RootLayout from "./pages/layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* ROOT */}
          <Route path="/" element={<App />} />
          {/* Auth */}
          <Route path="auth/splash" element={<SplashPage />} />
          <Route path="auth/splash/login" element={<LoginPage />} />
          <Route path="auth/splash/signup" element={<SignupPage />} />
          <Route path="auth/splash/forgot-password" element={<ForgotPasswordPage />} />
          {/* profile */}
          <Route path="profile" element={<ProfilePAge />} />
          <Route path="profile/recharge" element={<ProfilePAge />} />
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
            path="market/test/branchingtest/enviromnet"
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
          {/* anlysis */}
          <Route path="profile/ai/anlysis" element={<AiAnalysisPage />} />
          <Route
            path="profile/expert/anlysis"
            element={<ExpertAnalysisPage />}
          />
          <Route path="profile/expert" element={<ExpertProfilePage />} />
          {/* Report */}
          <Route path="report" element={<ReportPage />} />
          {/* Reward */}
          <Route path="reward" element={<RewardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
