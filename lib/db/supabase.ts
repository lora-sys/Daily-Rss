export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_login_at: string | null
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_login_at?: string | null
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_login_at?: string | null
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      ai_configs: {
        Row: {
          api_key_encrypted: string
          api_key_nonce: string
          base_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          metadata: Json | null
          model_name: string
          priority: number | null
          provider: string
          provider_name: string
          temperature: number | null
          updated_at: string | null
          use_for: string[]
        }
        Insert: {
          api_key_encrypted: string
          api_key_nonce: string
          base_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          metadata?: Json | null
          model_name: string
          priority?: number | null
          provider: string
          provider_name: string
          temperature?: number | null
          updated_at?: string | null
          use_for?: string[]
        }
        Update: {
          api_key_encrypted?: string
          api_key_nonce?: string
          base_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          metadata?: Json | null
          model_name?: string
          priority?: number | null
          provider?: string
          provider_name?: string
          temperature?: number | null
          updated_at?: string | null
          use_for?: string[]
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          ai_config_id: string | null
          ai_model: string | null
          ai_provider: string | null
          created_at: string | null
          date: string
          error_message: string | null
          id: string
          metadata: Json | null
          status: string | null
          summary_by_category: Json
          total_articles: number | null
          total_categories: number | null
          total_sources_fetched: number | null
          updated_at: string | null
        }
        Insert: {
          ai_config_id?: string | null
          ai_model?: string | null
          ai_provider?: string | null
          created_at?: string | null
          date: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          summary_by_category: Json
          total_articles?: number | null
          total_categories?: number | null
          total_sources_fetched?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_config_id?: string | null
          ai_model?: string | null
          ai_provider?: string | null
          created_at?: string | null
          date?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          summary_by_category?: Json
          total_articles?: number | null
          total_categories?: number | null
          total_sources_fetched?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_ai_config_id_fkey"
            columns: ["ai_config_id"]
            isOneToOne: false
            referencedRelation: "ai_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          ai_config_id: string | null
          ai_model: string | null
          ai_provider: string | null
          broadcast_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
          subject: string | null
          success_count: number | null
          summary_date: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          ai_config_id?: string | null
          ai_model?: string | null
          ai_provider?: string | null
          broadcast_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status: string
          subject?: string | null
          success_count?: number | null
          summary_date: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_config_id?: string | null
          ai_model?: string | null
          ai_provider?: string | null
          broadcast_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          success_count?: number | null
          summary_date?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_ai_config_id_fkey"
            columns: ["ai_config_id"]
            isOneToOne: false
            referencedRelation: "ai_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      fetch_logs: {
        Row: {
          articles_duplicate: number | null
          articles_fetched: number | null
          articles_new: number | null
          duration_ms: number | null
          error_message: string | null
          fetched_at: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          articles_duplicate?: number | null
          articles_fetched?: number | null
          articles_new?: number | null
          duration_ms?: number | null
          error_message?: string | null
          fetched_at?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          articles_duplicate?: number | null
          articles_fetched?: number | null
          articles_new?: number | null
          duration_ms?: number | null
          error_message?: string | null
          fetched_at?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fetch_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          category: string[]
          content: string
          created_at: string | null
          description: string | null
          id: string
          link: string
          metadata: Json | null
          pub_date: string
          source_id: string | null
          source_name: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string[]
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          link: string
          metadata?: Json | null
          pub_date: string
          source_id?: string | null
          source_name: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string[]
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string
          metadata?: Json | null
          pub_date?: string
          source_id?: string | null
          source_name?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          category: string[]
          created_at: string | null
          description: string | null
          failure_count: number | null
          feed_url: string | null
          fetch_interval_minutes: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          metadata: Json | null
          name: string
          priority: number | null
          rsshub_params: Json | null
          rsshub_route: string | null
          success_count: number | null
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string[]
          created_at?: string | null
          description?: string | null
          failure_count?: number | null
          feed_url?: string | null
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          name: string
          priority?: number | null
          rsshub_params?: Json | null
          rsshub_route?: string | null
          success_count?: number | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string[]
          created_at?: string | null
          description?: string | null
          failure_count?: number | null
          feed_url?: string | null
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          name?: string
          priority?: number | null
          rsshub_params?: Json | null
          rsshub_route?: string | null
          success_count?: number | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      article_exists_by_link: { Args: { link_param: string }; Returns: boolean }
      get_active_ai_config: {
        Args: { use_for_param: string }
        Returns: {
          api_key: string
          base_url: string
          id: string
          model_name: string
          priority: number
          provider: string
          use_for: string[]
        }[]
      }
      get_articles_by_date_range: {
        Args: {
          category_filter?: string[]
          end_date: string
          limit_count?: number
          start_date: string
        }
        Returns: {
          article_id: string
          category: string[]
          description: string
          link: string
          metadata: Json
          pub_date: string
          source: string
          title: string
        }[]
      }
      get_articles_by_sources: {
        Args: {
          limit_count?: number
          source_filter: string[]
          target_date: string
        }
        Returns: {
          article_id: string
          category: string[]
          description: string
          link: string
          pub_date: string
          source: string
          title: string
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          active_sources: number
          ai_config_model: string
          ai_config_provider: string
          articles_this_week: number
          articles_today: number
          last_email_sent: string
          last_summary_date: string
          overall_success_rate: number
          total_articles: number
          total_sources: number
        }[]
      }
      get_top_articles_by_tag: {
        Args: { limit_count?: number; tag: string; target_date: string }
        Returns: {
          article_id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
