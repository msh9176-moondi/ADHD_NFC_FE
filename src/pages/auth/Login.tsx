import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-8">
      <div className="flex flex-col gap-30">
        {/* 일반 로그인 */}
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

          <Button className="w-30 h-11 rounded-full text-white font-medium bg-[#795549] hover:bg-[#795549]/90">
            로그인
          </Button>
        </div>

        {/* 소셜 로그인 */}
        <div className="flex flex-col w-full max-w-md mx-auto">
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549]"
            >
              카카오 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549]"
            >
              구글 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549]"
            >
              네이버 로그인
            </Button>
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
