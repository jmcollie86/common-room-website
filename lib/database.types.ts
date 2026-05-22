export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          gender: string | null;
          year_of_birth: number | null;
          home_postcode: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          gender?: string | null;
          year_of_birth?: number | null;
          home_postcode?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          gender?: string | null;
          year_of_birth?: number | null;
          home_postcode?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      adopt_themes: {
        Row: {
          id: number;
          category: string;
          theme: string;
          description: string | null;
          third_person_description: string | null;
          category_colour: string | null;
        };
        Insert: {
          id?: number;
          category: string;
          theme: string;
          description?: string | null;
          third_person_description?: string | null;
          category_colour?: string | null;
        };
        Update: {
          id?: number;
          category?: string;
          theme?: string;
          description?: string | null;
          third_person_description?: string | null;
          category_colour?: string | null;
        };
        Relationships: [];
      };
      user_adopt_selections: {
        Row: {
          id: string;
          user_id: string;
          theme_id: number;
          selected_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme_id: number;
          selected_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme_id?: number;
          selected_at?: string;
        };
        Relationships: [];
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          generated_at: string;
          theme_ids: number[] | null;
          content: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_at?: string;
          theme_ids?: number[] | null;
          content: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_at?: string;
          theme_ids?: number[] | null;
          content?: Json;
        };
        Relationships: [];
      };
      purpose_snapshots: {
        Row: {
          id: string;
          user_id: string;
          captured_at: string;
          theme_ids: number[];
          reflection_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          captured_at?: string;
          theme_ids: number[];
          reflection_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          captured_at?: string;
          theme_ids?: number[];
          reflection_id?: string | null;
        };
        Relationships: [];
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          updated_at: string;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          updated_at?: string;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          updated_at?: string;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
