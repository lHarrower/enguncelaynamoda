// Structured Supabase Database schema (manually curated).
// NOTE: Keep in sync with Supabase migrations. Favor narrow, explicit field types.

export interface WardrobeItemRecord {
  id: string;
  user_id: string;
  image_uri: string | null;
  processed_image_uri: string | null;
  category: string | null;
  color_palette: string[] | null;
  style_tags: string[] | null;
  created_at: string; // ISO timestamp
  updated_at: string | null;
  ai_main_category: string | null;
  ai_sub_category: string | null;
  ai_dominant_colors: string[] | null;
  ai_cache: Record<string, unknown> | null;
}

export interface OutfitFeedbackRecord {
  id: string;
  user_id: string;
  outfit_id: string;
  confidence_rating: number | null;
  comfort_physical: number | null;
  comfort_emotional: number | null;
  weather_context: string | null; // JSON serialized
  created_at: string;
}

export interface OutfitRecommendationRecord {
  id: string;
  user_id: string;
  item_ids: string[];
  confidence_score: number | null;
  generated_at: string;
}

export interface UserPreferencesRecord {
  user_id: string;
  preferred_colors: string[] | null;
  preferred_styles: string[] | null;
  body_type_preferences: string[] | null;
  occasion_preferences: string[] | null;
  confidence_patterns: string[] | null;
  confidence_note_style: string | null;
  share_usage_data: boolean | null;
  allow_location_tracking: boolean | null;
  enable_social_features: boolean | null;
  data_retention_days: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface DatabaseTables {
  wardrobe_items: WardrobeItemRecord;
  outfit_feedback: OutfitFeedbackRecord;
  outfit_recommendations: OutfitRecommendationRecord;
  user_preferences: UserPreferencesRecord;
}

export type TableName = keyof DatabaseTables;

export type Row<T extends TableName> = DatabaseTables[T];

export interface Database {
  public: {
    Tables: { [K in TableName]: { Row: DatabaseTables[K] } };
  };
}

// Generic typed Supabase-like response (subset used in app)
export interface QueryResponse<T> {
  data: T[] | null;
  error: { message: string } | null;
}
