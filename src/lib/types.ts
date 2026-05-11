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
          correct_answer?: string
          order_num?: number
          created_at?: string
        }
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
      }
    }
  }
}

// Convenience row types
export type Team = Database['public']['Tables']['teams']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
export type TeamScore = Database['public']['Views']['team_scores']['Row']

// Answer choice type
export type AnswerChoice = 'a' | 'b' | 'c' | 'd'
