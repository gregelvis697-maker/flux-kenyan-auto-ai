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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approval_audit: {
        Row: {
          action: string
          id: string
          performed_at: string
          performed_by: string
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          performed_at?: string
          performed_by: string
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          performed_at?: string
          performed_by?: string
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_audit_performed_by_profiles_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_audit_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_import_requests: {
        Row: {
          accepted_at: string | null
          budget: number
          created_at: string
          dealer_id: string
          delivered_at: string | null
          id: string
          importer_id: string | null
          make: string
          model: string
          specs: string | null
          status: Database["public"]["Enums"]["import_status"]
          updated_at: string
          year: number
        }
        Insert: {
          accepted_at?: string | null
          budget: number
          created_at?: string
          dealer_id: string
          delivered_at?: string | null
          id?: string
          importer_id?: string | null
          make: string
          model: string
          specs?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          updated_at?: string
          year: number
        }
        Update: {
          accepted_at?: string | null
          budget?: number
          created_at?: string
          dealer_id?: string
          delivered_at?: string | null
          id?: string
          importer_id?: string | null
          make?: string
          model?: string
          specs?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          condition: Database["public"]["Enums"]["vehicle_condition"]
          created_at: string
          dealer_id: string
          description: string | null
          engine_capacity: string
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          import_request_id: string | null
          is_sold: boolean
          make: string
          mileage: number | null
          model: string
          negotiable: boolean
          photos: string[] | null
          price: number
          transmission: string | null
          updated_at: string
          year: number
        }
        Insert: {
          color?: string | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          created_at?: string
          dealer_id: string
          description?: string | null
          engine_capacity: string
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id?: string
          import_request_id?: string | null
          is_sold?: boolean
          make: string
          mileage?: number | null
          model: string
          negotiable?: boolean
          photos?: string[] | null
          price: number
          transmission?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          color?: string | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          created_at?: string
          dealer_id?: string
          description?: string | null
          engine_capacity?: string
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          import_request_id?: string | null
          is_sold?: boolean
          make?: string
          mileage?: number | null
          model?: string
          negotiable?: boolean
          photos?: string[] | null
          price?: number
          transmission?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_import_request_id_fkey"
            columns: ["import_request_id"]
            isOneToOne: false
            referencedRelation: "dealer_import_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone_number: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone_number: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone_number?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: { admin_email: string; admin_user_id: string }
        Returns: undefined
      }
      get_role_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["approval_status"]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "buyer" | "dealer" | "importer" | "admin"
      approval_status: "pending" | "approved" | "rejected"
      fuel_type: "petrol" | "diesel" | "electric" | "hybrid" | "plug_in_hybrid"
      import_status:
        | "requested"
        | "accepted"
        | "in_transit"
        | "cleared"
        | "delivered"
        | "received"
      vehicle_condition: "new" | "used" | "certified_pre_owned"
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
    Enums: {
      app_role: ["buyer", "dealer", "importer", "admin"],
      approval_status: ["pending", "approved", "rejected"],
      fuel_type: ["petrol", "diesel", "electric", "hybrid", "plug_in_hybrid"],
      import_status: [
        "requested",
        "accepted",
        "in_transit",
        "cleared",
        "delivered",
        "received",
      ],
      vehicle_condition: ["new", "used", "certified_pre_owned"],
    },
  },
} as const
