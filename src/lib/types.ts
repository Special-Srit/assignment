// Answer choice type (defined first — referenced in table types below)
export type AnswerChoice = 'a' | 'b' | 'c' | 'd'

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: AnswerChoice
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: AnswerChoice
          order_num?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: AnswerChoice
          order_num?: number
          created_at?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          id: string
          player_name: string
          team_id: string | null
          score: number
          total_questions: number
          created_at: string
        }
        Insert: {
          id?: string
          player_name: string
          team_id?: string | null
          score?: number
          total_questions: number
          created_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          team_id?: string | null
          score?: number
          total_questions?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'scores_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      team_scores: {
        Row: {
          team_id: string
          team_name: string
          player_count: number
          total_score: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Team = Database['public']['Tables']['teams']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
export type TeamScore = Database['public']['Views']['team_scores']['Row']
