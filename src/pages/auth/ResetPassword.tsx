import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Asterisk, CheckCircle, Eye, EyeOff } from "lucide-react";
import {
  PrimaryPillButton,
  SocialPillButton,
} from "@/components/common/PillButton";
import { useAuthStore } from "@/stores/authStore";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      alert("유효하지 않은 링크입니다.");
      return;
    }

    clearError();

    try {
      await resetPassword({
        token,
        password: data.password,
        passwordConfirm: data.confirmPassword,
      });
      setIsSubmitted(true);
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  // 토큰이 없는 경우
  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="text-4xl text-[#795549] font-bold mb-6">
            유효하지 않은 링크
          </div>
          <p className="text-center text-[#795549]/70 mb-8">
            비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
          </p>
          <Link
            to="/auth/splash/forgot-password"
            className="text-[#795549] underline cursor-pointer"
          >
            비밀번호 찾기로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 재설정 완료 화면
  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-[#F5F0E5] flex items-center justify-center mb-8">
            <CheckCircle className="w-10 h-10 text-[#795549]" />
          </div>

          {/* 타이틀 */}
          <div className="text-4xl text-[#795549] font-bold mb-6">
            비밀번호 변경 완료
          </div>

          {/* 안내 문구 */}
          <p className="text-center text-[#795549]/70 mb-8">
            비밀번호가 성공적으로 변경되었습니다.
            <br />새 비밀번호로 로그인해주세요.
          </p>

          {/* 로그인 버튼 */}
          <PrimaryPillButton
            onClick={() => navigate("/auth/splash/login")}
            className="w-full"
          >
            로그인하기
          </PrimaryPillButton>
        </div>
      </div>
    );
  }

  // 비밀번호 입력 화면
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* 타이틀 */}
        <div className="flex flex-col text-5xl text-[#795549] font-bold m-8 text-center">
          <span>Reset</span>
          <span>password</span>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-[#795549]/70 m-12">
          새로운 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* 새 비밀번호 입력 */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-1 mb-2 pl-4">
              <Asterisk className="text-red-500 size-3.5" />
              <label className="text-sm text-[#795549]">새 비밀번호</label>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="새 비밀번호를 입력해주세요"
                className="w-full h-12 px-6 pr-12 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795549]/50 hover:text-[#795549] transition-colors"
              >
                {showPassword ? (
                  <Eye className="size-5 cursor-pointer" />
                ) : (
                  <EyeOff className="size-5 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 pl-4">
                {errors.password.message}
              </p>
            )}
            <p className="text-[#795549]/60 text-xs mt-1 pl-4">
              비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.
            </p>
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className="w-full mb-8">
            <div className="flex items-center gap-1 mb-2 pl-4">
              <Asterisk className="text-red-500 size-3.5" />
              <label className="text-sm text-[#795549]">비밀번호 확인</label>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력해주세요"
                className="w-full h-12 px-6 pr-12 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795549]/50 hover:text-[#795549] transition-colors"
              >
                {showConfirmPassword ? (
                  <Eye className="size-5 cursor-pointer" />
                ) : (
                  <EyeOff className="size-5 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 pl-4">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API 에러 표시 */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* 변경 버튼 */}
          <SocialPillButton type="submit" disabled={isLoading}>
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </SocialPillButton>
        </form>

        {/* 로그인으로 돌아가기 */}
        <div className="text-center mt-6">
          <Link
            to="/auth/splash/login"
            className="text-[#795549] underline cursor-pointer"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
