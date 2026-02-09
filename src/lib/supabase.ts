import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL과 Anon Key가 필요합니다. .env 파일을 확인하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_number: string | null;
          email: string | null;
          nickname: string | null;
          profile_image: string | null;
          role: "user" | "admin" | "expert" | "seller";
          is_active: boolean;
          last_login_at: string | null;
          real_name: string | null;
          phone: string | null;
          zip_code: string | null;
          address: string | null;
          address_detail: string | null;
          delivery_request: string | null;
          coin_balance: number;
          xp: number;
          total_tag_count: number;
          planner_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string | null;
          mood: string;
          routine_score: number;
          completed_routines: string[] | null;
          note: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_logs"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["daily_logs"]["Insert"]>;
      };
      trait_scores: {
        Row: {
          id: number;
          user_id: string;
          attention: number;
          impulsive: number;
          complex: number;
          emotional: number;
          motivation: number;
          environment: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["trait_scores"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["trait_scores"]["Insert"]>;
      };
      nfc_cards: {
        Row: {
          id: string;
          user_id: string;
          card_uid: string;
          card_name: string | null;
          is_active: boolean;
          last_used_at: string | null;
          total_tag_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["nfc_cards"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["nfc_cards"]["Insert"]>;
      };
      coin_history: {
        Row: {
          id: string;
          user_id: string;
          type: "earn" | "use" | "expire" | "admin_grant" | "admin_deduct";
          amount: number;
          balance_after: number;
          description: string | null;
          reference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["coin_history"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["coin_history"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          price: number;
          category: "focus" | "wellness" | "lifestyle";
          recommended_trait: "attention" | "impulsive" | "complex" | "emotional" | "motivation" | "environment" | null;
          is_available: boolean;
          is_coming_soon: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      ai_monthly_reports: {
        Row: {
          id: string;
          user_id: string | null;
          year_month: string;
          summary_json: Record<string, unknown> | null;
          detail_json: Record<string, unknown> | null;
          stats_json: Record<string, unknown> | null;
          model: string | null;
          prompt_version: string | null;
          regenerate_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_monthly_reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ai_monthly_reports"]["Insert"]>;
      };
    };
  };
};
