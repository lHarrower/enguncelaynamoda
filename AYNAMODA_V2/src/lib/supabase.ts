import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase instance
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// Server-side Supabase instance
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database schema types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      clothing_items: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string
          category: string
          subcategory: string | null
          colors: string[]
          tags: string[]
          brand: string | null
          size: string | null
          season: string[] | null
          purchase_date: string | null
          price: number | null
          notes: string | null
          user_modified_tags: string[] | null
          user_modified_colors: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url: string
          category: string
          subcategory?: string | null
          colors?: string[]
          tags?: string[]
          brand?: string | null
          size?: string | null
          season?: string[] | null
          purchase_date?: string | null
          price?: number | null
          notes?: string | null
          user_modified_tags?: string[] | null
          user_modified_colors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string
          category?: string
          subcategory?: string | null
          colors?: string[]
          tags?: string[]
          brand?: string | null
          size?: string | null
          season?: string[] | null
          purchase_date?: string | null
          price?: number | null
          notes?: string | null
          user_modified_tags?: string[] | null
          user_modified_colors?: string[] | null
          updated_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          clothing_item_id: string
          original_colors: string[]
          original_tags: string[]
          original_category: string
          original_subcategory: string | null
          confidence_score: number
          analysis_date: string
          created_at: string
        }
        Insert: {
          id?: string
          clothing_item_id: string
          original_colors: string[]
          original_tags: string[]
          original_category: string
          original_subcategory?: string | null
          confidence_score: number
          analysis_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          clothing_item_id?: string
          original_colors?: string[]
          original_tags?: string[]
          original_category?: string
          original_subcategory?: string | null
          confidence_score?: number
          analysis_date?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string | null
          clothing_items: string[]
          occasion: string[] | null
          season: string[] | null
          weather: string[] | null
          rating: number | null
          worn_dates: string[]
          is_favorite: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url?: string | null
          clothing_items: string[]
          occasion?: string[] | null
          season?: string[] | null
          weather?: string[] | null
          rating?: number | null
          worn_dates?: string[]
          is_favorite?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          clothing_items?: string[]
          occasion?: string[] | null
          season?: string[] | null
          weather?: string[] | null
          rating?: number | null
          worn_dates?: string[]
          is_favorite?: boolean
          tags?: string[]
          updated_at?: string
        }
      }
    }
  }
} 