import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Asterisk, Eye, EyeOff } from "lucide-react";
import { SocialPillButton } from "@/components/common/PillButton";
import { useAuthStore } from "@/stores/authStore";

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식을 입력해주세요"),
    password: z.string().min(1, "비밀번호를 입력해주세요"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    plannerNumber: z
      .string()
      .optional()
      .refine((val) => !val || val.startsWith("#"), {
        message: "플래너 번호는 #으로 시작해야 합니다",
      }),
    termsOfService: z.boolean().refine((val) => val === true, {
      message: "서비스 이용약관에 동의해주세요",
    }),
    privacyPolicy: z.boolean().refine((val) => val === true, {
      message: "개인정보 처리방침에 동의해주세요",
    }),
    marketing: z.boolean().optional(),
  })
  .refine((data) => data.password.length >= 8, {
    message: "비밀번호는 8자 이상이어야 합니다",
    path: ["password"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      plannerNumber: "",
      termsOfService: false,
      privacyPolicy: false,
      marketing: false,
    },
  });

  const termsOfService = watch("termsOfService");
  const privacyPolicy = watch("privacyPolicy");
  const marketing = watch("marketing");

  const allChecked = termsOfService && privacyPolicy && marketing;

  const handleAllCheck = (checked: boolean) => {
    setValue("termsOfService", checked);
    setValue("privacyPolicy", checked);
    setValue("marketing", checked);
  };

  const onSubmit = async (data: SignupFormData) => {
    clearError();

    try {
      await signup({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        agreeTermsOfService: data.termsOfService,
        agreePrivacyPolicy: data.privacyPolicy,
        agreeMarketing: data.marketing ?? false,
        plannerNumber: data.plannerNumber || undefined,
      });
      alert("회원가입이 완료되었습니다!");
      navigate("/auth/splash/login");
    } catch (err: unknown) {
      console.error("회원가입 에러:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center"
      >
        {/* 타이틀 */}
        <div className="text-6xl text-[#795549] font-bold p-12">Sign up</div>

        {/* 이메일 입력 */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <Asterisk className="text-red-500 size-3.5" />
            <label className="text-sm font-bold text-[#795549]">이메일</label>
          </div>
          <Input
            type="email"
            placeholder="이메일을 입력해주세요"
            className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 pl-4">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <Asterisk className="text-red-500 size-3.5" />
            <label className="text-sm font-bold text-[#795549]">비밀번호</label>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
              className="w-full h-12 px-4 pr-12 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795549]/50 hover:text-[#795549] transition-colors"
            >
              {showPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
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
        <div className="w-full mb-6">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <Asterisk className="text-red-500 size-3.5" />
            <label className="text-sm font-bold text-[#795549]">
              비밀번호 확인
            </label>
          </div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력해주세요"
              className="w-full h-12 px-4 pr-12 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795549]/50 hover:text-[#795549] transition-colors"
            >
              {showConfirmPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 pl-4">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* 플래너 고유 번호 (선택) */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <label className="text-sm font-bold text-[#795549]">
              플래너 고유 번호 (선택)
            </label>
          </div>
          <Input
            type="text"
            placeholder="#으로 시작하는 플래너 번호"
            className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
            {...register("plannerNumber")}
          />
          {errors.plannerNumber && (
            <p className="text-red-500 text-xs mt-1 pl-4">
              {errors.plannerNumber.message}
            </p>
          )}
          <p className="text-[#795549]/60 text-xs mt-1 pl-4">
            플래너가 있다면 고유 번호를 입력해주세요. 나중에 마이페이지에서
            수정할 수 있습니다.
          </p>
        </div>

        {/* 약관 동의 */}
        <div className="w-full mb-16 space-y-3">
          {/* 전체 동의 */}
          <div className="flex items-center gap-3 pl-2 pb-2 border-b border-[#795549]/20">
            <Checkbox
              id="allAgree"
              checked={allChecked}
              onCheckedChange={(checked) => handleAllCheck(checked === true)}
            />
            <label
              htmlFor="allAgree"
              className="text-md text-[#795549] font-bold cursor-pointer"
            >
              전체 동의
            </label>
          </div>

          {/* 서비스 이용약관 동의 (필수) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="termsOfService"
              checked={termsOfService}
              onCheckedChange={(checked) =>
                setValue("termsOfService", checked === true)
              }
            />
            <label
              htmlFor="termsOfService"
              className="text-sm text-[#795549] cursor-pointer flex items-center gap-1"
            >
              <Asterisk className="text-red-500 size-3.5" />
              (필수) 서비스 이용약관 동의
            </label>
          </div>
          {errors.termsOfService && (
            <p className="text-red-500 text-xs pl-9">
              {errors.termsOfService.message}
            </p>
          )}

          {/* 개인정보 처리방침 동의 (필수) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="privacyPolicy"
              checked={privacyPolicy}
              onCheckedChange={(checked) =>
                setValue("privacyPolicy", checked === true)
              }
            />
            <label
              htmlFor="privacyPolicy"
              className="text-sm text-[#795549] cursor-pointer flex items-center gap-1"
            >
              <Asterisk className="text-red-500 size-3.5" />
              (필수) 개인정보 처리방침 동의
            </label>
          </div>
          {errors.privacyPolicy && (
            <p className="text-red-500 text-xs pl-9">
              {errors.privacyPolicy.message}
            </p>
          )}

          {/* 마케팅 및 광고 수신 동의 (선택) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="marketing"
              checked={marketing}
              onCheckedChange={(checked) =>
                setValue("marketing", checked === true)
              }
            />
            <label
              htmlFor="marketing"
              className="text-sm text-[#795549] cursor-pointer"
            >
              (선택) 마케팅 및 광고 수신 동의
            </label>
          </div>
        </div>

        {/* API 에러 표시 */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* 회원가입 버튼 */}
        <SocialPillButton
          type="submit"
          className="text-lg font-bold cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "회원가입 중..." : "회원가입"}
        </SocialPillButton>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-4 text-center text-[#795549]">
        <span>이미 계정이 있으신가요? </span>
        <Link
          to="/auth/splash/login"
          className="font-bold underline cursor-pointer"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}

export default SignupPage;
