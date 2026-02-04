// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  role: "user" | "expert" | "admin";
  profile?: {
    nickname?: string;
    name?: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
  };
  address?: {
    zipCode?: string;
    address?: string;
    addressDetail?: string;
    deliveryRequest?: string;
  };
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  user: User;
}

// 회원가입 요청 타입
export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTermsOfService: boolean;
  agreePrivacyPolicy: boolean;
  agreeMarketing: boolean;
}

// 회원가입 응답 타입
export interface SignupResponse {
  accessToken: string;
  user: User;
}

// 소셜 로그인 요청 타입
export interface SocialLoginRequest {
  provider: "KAKAO" | "GOOGLE" | "NAVER";
  accessToken: string;
}

// 소셜 로그인 회원가입 완료 요청 타입
export interface SocialSignupCompleteRequest {
  provider: "KAKAO" | "GOOGLE" | "NAVER";
  accessToken: string;
  termsOfService: boolean;
  privacyPolicy: boolean;
  marketing?: boolean;
}

// 프로필 수정 요청 타입
export interface UpdateProfileRequest {
  nickname?: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}

// 비밀번호 찾기 요청 타입
export interface ForgotPasswordRequest {
  email: string;
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirm: string;
}

// 배송지 수정 요청 타입
export interface UpdateAddressRequest {
  zipCode?: string;
  address?: string;
  addressDetail?: string;
  deliveryRequest?: string;
}
