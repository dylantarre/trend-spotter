export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      trends: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          engagement: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          engagement?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          engagement?: number | null
          created_at?: string
        }
      }
      trend_history: {
        Row: {
          id: string
          trend_id: string
          engagement: number | null
          captured_at: string
        }
        Insert: {
          id?: string
          trend_id: string
          engagement?: number | null
          captured_at?: string
        }
        Update: {
          id?: string
          trend_id?: string
          engagement?: number | null
          captured_at?: string
        }
      }
    }
  }
}