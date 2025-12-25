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
  public: {
    Tables: {
      channel_categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_category_channels: {
        Row: {
          category_id: string
          channel_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          category_id: string
          channel_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          category_id?: string
          channel_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_category_channels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "channel_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_category_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_subscriptions: {
        Row: {
          category: string | null
          channel_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          channel_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          category?: string | null
          channel_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_subscriptions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
          {
            foreignKeyName: "channel_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_watch_sessions: {
        Row: {
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          updated_at?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_watch_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_watch_limit_minutes: number | null
          email: string | null
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          time_zone: string | null
          updated_at: string | null
          watch_limit_enabled: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_watch_limit_minutes?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          time_zone?: string | null
          updated_at?: string | null
          watch_limit_enabled?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_watch_limit_minutes?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          time_zone?: string | null
          updated_at?: string | null
          watch_limit_enabled?: boolean | null
        }
        Relationships: []
      }
      user_video_state: {
        Row: {
          completed: boolean | null
          created_at: string | null
          first_watched_at: string | null
          id: string
          last_watched_at: string | null
          progress_seconds: number | null
          total_watched_seconds: number | null
          updated_at: string | null
          user_id: string
          video_id: string
          watch_count: number | null
          watched: boolean | null
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          first_watched_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_seconds?: number | null
          total_watched_seconds?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
          watch_count?: number | null
          watched?: boolean | null
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          first_watched_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_seconds?: number | null
          total_watched_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
          watch_count?: number | null
          watched?: boolean | null
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_video_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channels: {
        Row: {
          channel_id: string
          created_at: string | null
          custom_url: string | null
          description: string | null
          id: string
          subscriber_count: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploads_playlist_id: string | null
          video_count: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id?: string
          subscriber_count?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploads_playlist_id?: string | null
          video_count?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id?: string
          subscriber_count?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploads_playlist_id?: string | null
          video_count?: string | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          like_count: string | null
          published_at: string
          thumbnail_high_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_id: string
          view_count: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          like_count?: string | null
          published_at: string
          thumbnail_high_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_id: string
          view_count?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          like_count?: string | null
          published_at?: string
          thumbnail_high_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string
          view_count?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_channels: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          channel_id: string
          created_at: string
          custom_url: string
          description: string
          id: string
          subscriber_count: string
          thumbnail_url: string
          title: string
          video_count: string
        }[]
      }
      get_user_feed: {
        Args: {
          p_channel_ids: string[]
          p_cursor?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          channel_custom_url: string
          channel_id: string
          channel_thumbnail_url: string
          channel_title: string
          description: string
          duration: string
          id: string
          like_count: string
          published_at: string
          thumbnail_high_url: string
          thumbnail_url: string
          title: string
          video_id: string
          view_count: string
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
  public: {
    Enums: {},
  },
} as const

// Type aliases for convenience
export type ChannelCategory = Tables<"channel_categories">
export type Profile = Tables<"profiles">
export type YouTubeChannel = Tables<"youtube_channels">
export type YouTubeVideo = Tables<"youtube_videos">
export type ChannelSubscription = Tables<"channel_subscriptions">
export type UserVideoState = Tables<"user_video_state">
export type DailyWatchSession = Tables<"daily_watch_sessions">
