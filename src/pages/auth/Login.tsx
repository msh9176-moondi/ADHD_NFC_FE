import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  PrimaryPillButton,
  SocialPillButton,
} from '@/components/common/PillButton';

function LoginPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-8">
      <div className="flex flex-col gap-30">
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="text-6xl text-[#795549] font-bold mb-12">Log in</div>

          <Input
            type="email"
            placeholder="이메일"
            className="w-full h-12 px-4 mb-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
          />

          <Input
            type="password"
            placeholder="비밀번호"
            className="w-full h-12 px-4 mb-2 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
          />

          <div className="w-full text-right mb-6">
            <Link
              to="/auth/splash/forgot-password"
              className="text-sm text-[#795549] hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <PrimaryPillButton className="w-30">로그인</PrimaryPillButton>
        </div>

        <div className="flex flex-col w-full max-w-md mx-auto">
          <div className="space-y-3 mb-6">
            <SocialPillButton>카카오 로그인</SocialPillButton>
            <SocialPillButton>구글 로그인</SocialPillButton>
            <SocialPillButton>네이버 로그인</SocialPillButton>
          </div>

          <div className="text-center text-[#795549]">
            <span>계정이 없으신가요? </span>
            <Link to="/auth/splash/signup" className="underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
