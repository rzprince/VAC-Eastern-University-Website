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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          display_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          active: boolean
          created_at: string
          department: string | null
          email: string | null
          id: string
          leader: boolean
          name: string
          phone: string | null
          photo_url: string | null
          position: string
          serial: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          leader?: boolean
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
          serial?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          leader?: boolean
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
          serial?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          poster_url: string | null
          published: boolean
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          poster_url?: string | null
          published?: boolean
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          poster_url?: string | null
          published?: boolean
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          destination_url: string | null
          featured: boolean
          id: string
          media_type: string
          published: boolean
          published_at: string
          thumbnail_url: string
          title: string
        }
        Insert: {
          created_at?: string
          destination_url?: string | null
          featured?: boolean
          id?: string
          media_type: string
          published?: boolean
          published_at?: string
          thumbnail_url: string
          title: string
        }
        Update: {
          created_at?: string
          destination_url?: string | null
          featured?: boolean
          id?: string
          media_type?: string
          published?: boolean
          published_at?: string
          thumbnail_url?: string
          title?: string
        }
        Relationships: []
      }
      member_applications: {
        Row: {
          address: string
          bkash_sender: string
          bkash_transaction_id: string
          blood_group: string
          created_at: string
          date_of_birth: string
          department: string
          email: string
          eu_id: string
          full_name: string
          id: string
          phone_whatsapp: string
          reason: string
          registration_fee: number
          skills: string
          status: string
        }
        Insert: {
          address: string
          bkash_sender: string
          bkash_transaction_id: string
          blood_group: string
          created_at?: string
          date_of_birth: string
          department: string
          email: string
          eu_id: string
          full_name: string
          id?: string
          phone_whatsapp: string
          reason: string
          registration_fee?: number
          skills: string
          status?: string
        }
        Update: {
          address?: string
          bkash_sender?: string
          bkash_transaction_id?: string
          blood_group?: string
          created_at?: string
          date_of_birth?: string
          department?: string
          email?: string
          eu_id?: string
          full_name?: string
          id?: string
          phone_whatsapp?: string
          reason?: string
          registration_fee?: number
          skills?: string
          status?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string
          bkash_number: string
          club_name: string
          facebook_group: string
          facebook_page: string
          id: boolean
          registration_fee: number
          short_name: string
          since: string
          tagline: string
          tenure: string
          university: string
          updated_at: string
        }
        Insert: {
          about_text?: string
          bkash_number?: string
          club_name?: string
          facebook_group?: string
          facebook_page?: string
          id?: boolean
          registration_fee?: number
          short_name?: string
          since?: string
          tagline?: string
          tenure?: string
          university?: string
          updated_at?: string
        }
        Update: {
          about_text?: string
          bkash_number?: string
          club_name?: string
          facebook_group?: string
          facebook_page?: string
          id?: boolean
          registration_fee?: number
          short_name?: string
          since?: string
          tagline?: string
          tenure?: string
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
