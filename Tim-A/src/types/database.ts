export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          description: string;
          id: string;
          name: string;
          rule: string;
          slug: string;
        };
        Insert: {
          description: string;
          id?: string;
          name: string;
          rule: string;
          slug: string;
        };
        Update: {
          description?: string;
          id?: string;
          name?: string;
          rule?: string;
          slug?: string;
        };
        Relationships: [];
      };
      conversation_scores: {
        Row: {
          completeness_score: number;
          confidence_score: number;
          created_at: string;
          fluency_score: number;
          id: string;
          improvement_tips: Json;
          overall_score: number;
          provider: string;
          relevance_score: number;
          session_id: string;
          speaking_quality_score: number;
          strengths: Json;
          user_id: string;
        };
        Insert: {
          completeness_score: number;
          confidence_score: number;
          created_at?: string;
          fluency_score: number;
          id?: string;
          improvement_tips?: Json;
          overall_score: number;
          provider: string;
          relevance_score: number;
          session_id: string;
          speaking_quality_score: number;
          strengths?: Json;
          user_id: string;
        };
        Update: {
          completeness_score?: number;
          confidence_score?: number;
          created_at?: string;
          fluency_score?: number;
          id?: string;
          improvement_tips?: Json;
          overall_score?: number;
          provider?: string;
          relevance_score?: number;
          session_id?: string;
          speaking_quality_score?: number;
          strengths?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_scores_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "practice_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_item_difficulties: {
        Row: {
          difficulty: "standard" | "competitive";
          id: string;
          lesson_item_id: string;
          metadata: Json;
          prompt_override: string | null;
          starting_health: number;
          time_limit_seconds: number | null;
          xp_multiplier: number;
        };
        Insert: {
          difficulty: "standard" | "competitive";
          id?: string;
          lesson_item_id: string;
          metadata?: Json;
          prompt_override?: string | null;
          starting_health?: number;
          time_limit_seconds?: number | null;
          xp_multiplier?: number;
        };
        Update: {
          difficulty?: "standard" | "competitive";
          id?: string;
          lesson_item_id?: string;
          metadata?: Json;
          prompt_override?: string | null;
          starting_health?: number;
          time_limit_seconds?: number | null;
          xp_multiplier?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_item_difficulties_lesson_item_id_fkey";
            columns: ["lesson_item_id"];
            isOneToOne: false;
            referencedRelation: "lesson_items";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_items: {
        Row: {
          answer: string | null;
          greek: string | null;
          id: string;
          kind: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          lesson_id: string;
          options: Json;
          order_index: number;
          prompt: string;
          scenario_goals: Json;
        };
        Insert: {
          answer?: string | null;
          greek?: string | null;
          id?: string;
          kind: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          lesson_id: string;
          options?: Json;
          order_index: number;
          prompt: string;
          scenario_goals?: Json;
        };
        Update: {
          answer?: string | null;
          greek?: string | null;
          id?: string;
          kind?: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          lesson_id?: string;
          options?: Json;
          order_index?: number;
          prompt?: string;
          scenario_goals?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_items_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          level: "beginner" | "intermediate" | "advanced";
          order_index: number;
          slug: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          level: "beginner" | "intermediate" | "advanced";
          order_index: number;
          slug: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          level?: "beginner" | "intermediate" | "advanced";
          order_index?: number;
          slug?: string;
          title?: string;
        };
        Relationships: [];
      };
      practice_answers: {
        Row: {
          answer_text: string | null;
          created_at: string;
          health_delta: number;
          id: string;
          is_correct: boolean | null;
          lesson_item_id: string | null;
          metadata: Json;
          session_id: string;
          time_spent_seconds: number | null;
        };
        Insert: {
          answer_text?: string | null;
          created_at?: string;
          health_delta?: number;
          id?: string;
          is_correct?: boolean | null;
          lesson_item_id?: string | null;
          metadata?: Json;
          session_id: string;
          time_spent_seconds?: number | null;
        };
        Update: {
          answer_text?: string | null;
          created_at?: string;
          health_delta?: number;
          id?: string;
          is_correct?: boolean | null;
          lesson_item_id?: string | null;
          metadata?: Json;
          session_id?: string;
          time_spent_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "practice_answers_lesson_item_id_fkey";
            columns: ["lesson_item_id"];
            isOneToOne: false;
            referencedRelation: "lesson_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "practice_answers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "practice_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      practice_sessions: {
        Row: {
          completed_at: string | null;
          difficulty: "standard" | "competitive";
          earned_xp: number;
          ending_health: number | null;
          id: string;
          lesson_id: string | null;
          mode: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          started_at: string;
          starting_health: number | null;
          status: "in_progress" | "completed" | "failed";
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          difficulty: "standard" | "competitive";
          earned_xp?: number;
          ending_health?: number | null;
          id?: string;
          lesson_id?: string | null;
          mode: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          started_at?: string;
          starting_health?: number | null;
          status?: "in_progress" | "completed" | "failed";
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          difficulty?: "standard" | "competitive";
          earned_xp?: number;
          ending_health?: number | null;
          id?: string;
          lesson_id?: string | null;
          mode?: "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
          started_at?: string;
          starting_health?: number | null;
          status?: "in_progress" | "completed" | "failed";
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_sessions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_streak: number;
          display_name: string;
          id: string;
          last_practiced_on: string | null;
          level: number;
          longest_streak: number;
          updated_at: string;
          xp: number;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          display_name?: string;
          id: string;
          last_practiced_on?: string | null;
          level?: number;
          longest_streak?: number;
          updated_at?: string;
          xp?: number;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          display_name?: string;
          id?: string;
          last_practiced_on?: string | null;
          level?: number;
          longest_streak?: number;
          updated_at?: string;
          xp?: number;
        };
        Relationships: [];
      };
      recordings: {
        Row: {
          created_at: string;
          duration_seconds: number | null;
          id: string;
          mime_type: string;
          session_id: string;
          storage_path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          mime_type: string;
          session_id: string;
          storage_path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          mime_type?: string;
          session_id?: string;
          storage_path?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recordings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "practice_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recordings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          date_format: string;
          font_size: number;
          primary_language: string;
          time_zone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          date_format?: string;
          font_size?: number;
          primary_language?: string;
          time_zone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          date_format?: string;
          font_size?: number;
          primary_language?: string;
          time_zone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_badges: {
        Row: {
          badge_id: string;
          earned_at: string;
          user_id: string;
        };
        Insert: {
          badge_id: string;
          earned_at?: string;
          user_id: string;
        };
        Update: {
          badge_id?: string;
          earned_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null;
          current_streak: number | null;
          display_name: string | null;
          id: string | null;
          level: number | null;
          xp: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
