import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Asterisk, Mail } from "lucide-react";
import { SocialPillButton } from "@/components/common/PillButton";
import { useAuthStore } from "@/stores/authStore";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식을 입력해주세요"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError();

    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  // 이메일 전송 완료 화면
  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-[#F5F0E5] flex items-center justify-center mb-8">
            <Mail className="w-10 h-10 text-[#795549]" />
          </div>

          {/* 타이틀 */}
          <div className="text-4xl text-[#795549] font-bold mb-6">
            이메일을 확인해주세요
          </div>

          {/* 안내 문구 */}
          <p className="text-center text-[#795549]/70 mb-8">
            <span className="font-medium text-[#795549]">{submittedEmail}</span>
            으로 비밀번호 재설정 링크를 보내드렸습니다. 이메일을 확인해주세요.
          </p>

          {/* 로그인으로 돌아가기 */}
          <Link
            to="/auth/splash/login"
            className="text-[#795549] underline cursor-pointer"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 이메일 입력 화면
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* 타이틀 */}
        <div className="flex flex-col text-5xl text-[#795549] font-bold m-8 text-center">
          <span>Forgot</span>
          <span>password</span>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-[#795549]/70 m-12">
          가입하신 이메일 주소를 입력해주세요.
          <br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* 이메일 입력 */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-1 mb-2 pl-4">
              <Asterisk className="text-red-500 size-3.5" />
              <label className="text-sm text-[#795549]">이메일</label>
            </div>
            <Input
              type="email"
              placeholder="이메일을 입력해주세요"
              className="w-full h-12 px-6 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 pl-4">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* API 에러 표시 */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* 전송 버튼 */}
          <SocialPillButton
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "전송 중..." : "재설정 링크 보내기"}
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

export default ForgotPasswordPage;
