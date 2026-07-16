// Tipos escritos à mão a partir de supabase/migrations/0000_full_schema.sql.
// Sem Supabase CLI nesta máquina para gerar automaticamente (supabase gen types) —
// se o schema mudar, atualize este arquivo junto.
//
// `Relationships: []` em cada tabela é exigido pela forma genérica que o
// supabase-js espera (GenericTable) para o schema ser reconhecido — sem isso,
// toda inferência de tipo (select/insert/update/rpc) cai silenciosamente em `never`.

export type UserRole = "patient" | "professional";

export type MeasurementContext =
  | "jejum"
  | "antes_cafe"
  | "antes_almoco"
  | "antes_jantar"
  | "depois_cafe_2h"
  | "depois_almoco_2h"
  | "depois_jantar_2h"
  | "antes_dormir"
  | "madrugada"
  | "outro";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          terms_accepted_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          terms_accepted_at: string;
          created_at?: string;
        };
        Update: Partial<{
          full_name: string;
        }>;
        Relationships: [];
      };
      professional_patient_links: {
        Row: {
          id: string;
          professional_id: string;
          patient_id: string;
          created_at: string;
        };
        // Sem INSERT/UPDATE pelo client — vínculo só é criado via RPC redeem_invite_code.
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      invite_codes: {
        Row: {
          id: string;
          professional_id: string;
          code: string;
          created_at: string;
          expires_at: string | null;
          used_by: string | null;
          used_at: string | null;
        };
        // Sem INSERT/UPDATE pelo client — geração/resgate só via RPC.
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      patient_targets: {
        Row: {
          id: string;
          patient_id: string;
          professional_id: string;
          min_mg_dl: number;
          max_mg_dl: number;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          professional_id: string;
          min_mg_dl: number;
          max_mg_dl: number;
          notes?: string | null;
          updated_at?: string;
        };
        Update: Partial<{
          min_mg_dl: number;
          max_mg_dl: number;
          notes: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      glucose_measurements: {
        Row: {
          id: string;
          patient_id: string;
          value_mg_dl: number;
          measured_at: string;
          context: MeasurementContext;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          value_mg_dl: number;
          measured_at: string;
          context: MeasurementContext;
          notes?: string | null;
        };
        Update: Partial<{
          value_mg_dl: number;
          measured_at: string;
          context: MeasurementContext;
          notes: string | null;
        }>;
        Relationships: [];
      };
      medication_doses: {
        Row: {
          id: string;
          patient_id: string;
          measurement_id: string | null;
          taken_at: string;
          medication_name: string;
          dose_amount: number;
          dose_unit: string;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          measurement_id?: string | null;
          taken_at: string;
          medication_name: string;
          dose_amount: number;
          dose_unit?: string;
        };
        Update: Partial<{
          measurement_id: string | null;
          taken_at: string;
          medication_name: string;
          dose_amount: number;
          dose_unit: string;
        }>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          patient_id: string;
          measurement_id: string | null;
          consumed_at: string;
          description: string;
          carbs_grams: number | null;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          measurement_id?: string | null;
          consumed_at: string;
          description: string;
          carbs_grams?: number | null;
        };
        Update: Partial<{
          measurement_id: string | null;
          consumed_at: string;
          description: string;
          carbs_grams: number | null;
        }>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          patient_id: string;
          measurement_id: string | null;
          performed_at: string;
          description: string;
          duration_minutes: number | null;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          measurement_id?: string | null;
          performed_at: string;
          description: string;
          duration_minutes?: number | null;
        };
        Update: Partial<{
          measurement_id: string | null;
          performed_at: string;
          description: string;
          duration_minutes: number | null;
        }>;
        Relationships: [];
      };
      patient_notes: {
        Row: {
          id: string;
          patient_id: string;
          noted_at: string;
          content: string;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          noted_at?: string;
          content: string;
        };
        Update: Partial<{
          noted_at: string;
          content: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_invite_code: {
        Args: { p_expires_in_hours?: number };
        Returns: string;
      };
      redeem_invite_code: {
        Args: { p_code: string };
        Returns: void;
      };
    };
  };
}
