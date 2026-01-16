import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식을 입력해주세요"),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    termsOfService: z.boolean().refine((val) => val === true, {
      message: "서비스 이용약관에 동의해주세요",
    }),
    privacyPolicy: z.boolean().refine((val) => val === true, {
      message: "개인정보 처리방침에 동의해주세요",
    }),
    marketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function SignupPage() {
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
      termsOfService: false,
      privacyPolicy: false,
      marketing: false,
    },
  });

  const termsOfService = watch("termsOfService");
  const privacyPolicy = watch("privacyPolicy");
  const marketing = watch("marketing");

  const onSubmit = (data: SignupFormData) => {
    console.log("회원가입 데이터:", data);
  };

  return (
    <div className="container">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center justify-center"
      >
        {/* 타이틀 */}
        <div className="flex-1 flex items-center justify-center py-12 text-6xl text-[#795549] font-bold">
          Sign up
        </div>

        {/* 이메일 입력 */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <span className="text-red-500 text-sm">*</span>
            <label className="text-sm text-[#795549]">이메일</label>
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
            <span className="text-red-500 text-sm">*</span>
            <label className="text-sm text-[#795549]">비밀번호</label>
          </div>
          <Input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 pl-4">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <span className="text-red-500 text-sm">*</span>
            <label className="text-sm text-[#795549]">비밀번호 확인</label>
          </div>
          <Input
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 pl-4">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* 약관 동의 */}
        <div className="w-full mb-6 space-y-3">
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
              <span className="text-red-500">*</span>
              서비스 이용약관 동의 (필수)
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
              <span className="text-red-500">*</span>
              개인정보 처리방침 동의 (필수)
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
              마케팅 및 광고 수신 동의 (선택)
            </label>
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          className="w-30 h-11 rounded-full text-white font-medium mb-6 bg-[#795549] hover:bg-[#795549]/90 cursor-pointer"
        >
          회원가입
        </Button>
      </form>

      {/* 로그인 링크 */}
      <div className="text-center text-[#795549]">
        <span>이미 계정이 있으신가요? </span>
        <Link to="/auth/splash/login" className="underline cursor-pointer">
          로그인
        </Link>
      </div>
    </div>
  );
}

export default SignupPage;
