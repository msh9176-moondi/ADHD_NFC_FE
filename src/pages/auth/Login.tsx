import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full h-full max-w-150 flex flex-col justify-between p-8">
        <div className="w-full flex flex-col items-center justify-center">
          {/* 타이틀 */}
          <div className="flex-1 flex items-center justify-center py-20 text-6xl text-[#795549] font-bold">
            Log in
          </div>

          {/* 이메일 입력 */}
          <div className="w-full mb-4">
            <Input
              type="email"
              placeholder="이메일"
              className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="w-full mb-2">
            <Input
              type="password"
              placeholder="비밀번호"
              className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
            />
          </div>

          {/* 비밀번호 찾기 */}
          <div className="w-full text-right mb-6">
            <Link
              to="/auth/splash/forgot-password"
              className="text-sm text-[#795549] hover:underline cursor-pointer"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 로그인 버튼 */}
          <Button className="w-30 h-11 rounded-full text-white font-medium mb-6 bg-[#795549] hover:bg-[#795549]/90 cursor-pointer">
            로그인
          </Button>
        </div>

        <div>
          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549] cursor-pointer"
            >
              카카오 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549] cursor-pointer"
            >
              구글 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549] cursor-pointer"
            >
              네이버 로그인
            </Button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center text-[#795549]">
            <span>계정이 없으신가요? </span>
            <Link to="/auth/splash/signup" className="underline cursor-pointer">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
