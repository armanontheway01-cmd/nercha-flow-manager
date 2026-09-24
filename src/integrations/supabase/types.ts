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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          login_id: string
          name: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_id: string
          name?: string
          password_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          login_id?: string
          name?: string
          password_hash?: string
        }
        Relationships: []
      }
      distributors: {
        Row: {
          created_at: string
          id: string
          login_id: string
          name: string
          password_hash: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          login_id: string
          name: string
          password_hash: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          login_id?: string
          name?: string
          password_hash?: string
          phone?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_name: string
          id: string
          note: string | null
          packets: number
          phone: string | null
          receipt_no: string
        }
        Insert: {
          amount?: number
          created_at?: string
          donor_name: string
          id?: string
          note?: string | null
          packets?: number
          phone?: string | null
          receipt_no: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string
          id?: string
          note?: string | null
          packets?: number
          phone?: string | null
          receipt_no?: string
        }
        Relationships: []
      }
      duties: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          name: string
          start_time: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          name: string
          start_time?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          name?: string
          start_time?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      incharge_duties: {
        Row: {
          duty_id: string
          incharge_id: string
        }
        Insert: {
          duty_id: string
          incharge_id: string
        }
        Update: {
          duty_id?: string
          incharge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incharge_duties_duty_id_fkey"
            columns: ["duty_id"]
            isOneToOne: false
            referencedRelation: "duties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incharge_duties_incharge_id_fkey"
            columns: ["incharge_id"]
            isOneToOne: false
            referencedRelation: "incharges"
            referencedColumns: ["id"]
          },
        ]
      }
      incharges: {
        Row: {
          created_at: string
          id: string
          login_id: string
          name: string
          password_hash: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          login_id: string
          name: string
          password_hash: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          login_id?: string
          name?: string
          password_hash?: string
          phone?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
          quantity: number
          status: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
          quantity?: number
          status?: string
          unit?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          quantity?: number
          status?: string
          unit?: string
        }
        Relationships: []
      }
      site_status: {
        Row: {
          headline: string
          id: number
          is_ongoing: boolean
          notice: string | null
          packets_issued: number
          subline: string
          updated_at: string
        }
        Insert: {
          headline?: string
          id?: number
          is_ongoing?: boolean
          notice?: string | null
          packets_issued?: number
          subline?: string
          updated_at?: string
        }
        Update: {
          headline?: string
          id?: number
          is_ongoing?: boolean
          notice?: string | null
          packets_issued?: number
          subline?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          adno: string
          created_at: string
          dept: string | null
          duty_id: string | null
          id: string
          is_captain: boolean
          name: string
          phone: string | null
          present: boolean
        }
        Insert: {
          adno: string
          created_at?: string
          dept?: string | null
          duty_id?: string | null
          id?: string
          is_captain?: boolean
          name: string
          phone?: string | null
          present?: boolean
        }
        Update: {
          adno?: string
          created_at?: string
          dept?: string | null
          duty_id?: string | null
          id?: string
          is_captain?: boolean
          name?: string
          phone?: string | null
          present?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "students_duty_id_fkey"
            columns: ["duty_id"]
            isOneToOne: false
            referencedRelation: "duties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          code: string
          created_at: string
          donor_name: string
          id: string
          packets: number
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          donor_name: string
          id?: string
          packets?: number
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          donor_name?: string
          id?: string
          packets?: number
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
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
