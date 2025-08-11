// AYNA Mirror Daily Ritual - Core Data Types
// Enhanced interfaces for the confidence-building daily ritual system

// ============================================================================
// CORE WARDROBE INTERFACES (Enhanced)
// ============================================================================

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUri: string;
  processedImageUri: string;
  category: ItemCategory;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  tags: string[];
  notes?: string;
  
  // Naming features
  name?: string;
  aiGeneratedName?: string;
  nameOverride: boolean;
  aiAnalysisData?: AIAnalysisData;
  
  // Intelligence features
  usageStats: UsageStats;
  styleCompatibility: Record<string, number>;
  confidenceHistory: ConfidenceRating[];
  lastWorn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  itemId: string;
  totalWears: number;
  lastWorn: Date | null;
  averageRating: number;
  complimentsReceived: number;
  costPerWear: number;
}

export interface UtilizationStats {
  totalItems: number;
  activeItems: number;
  neglectedItems: number;
  averageCostPerWear: number;
  utilizationPercentage: number;
}

export interface ConfidenceRating {
  rating: number;
  date: Date;
  context?: string;
}

export type ItemCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'shoes' 
  | 'accessories' 
  | 'outerwear' 
  | 'dresses' 
  | 'activewear';

// ============================================================================
// AI NAMING INTERFACES
// ============================================================================

export interface AIAnalysisData {
  detectedTags: string[];
  dominantColors: string[];
  confidence: number;
  visualFeatures: VisualFeatures;
  namingSuggestions: string[];
  analysisTimestamp: Date;
}

export interface VisualFeatures {
  texture?: string;
  pattern?: string;
  style?: string;
  fit?: string;
  material?: string;
  occasion?: string;
}

export interface NamingPreferences {
  userId: string;
  namingStyle: NamingStyle;
  includeBrand: boolean;
  includeColor: boolean;
  includeMaterial: boolean;
  includeStyle: boolean;
  preferredLanguage: string;
  autoAcceptAINames: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NamingStyle = 'descriptive' | 'creative' | 'minimal' | 'brand_focused';

export interface ItemNamingHistory {
  id: string;
  itemId: string;
  userId: string;
  aiGeneratedName?: string;
  userProvidedName?: string;
  namingConfidence: number;
  aiTags: string[];
  visualFeatures: VisualFeatures;
  createdAt: Date;
}

export interface NamingRequest {
  itemId?: string;
  imageUri: string;
  category?: ItemCategory;
  subcategory?: string;
  colors?: string[];
  brand?: string;
  userPreferences?: NamingPreferences;
}

export interface NamingResponse {
  aiGeneratedName: string;
  confidence: number;
  suggestions: string[];
  analysisData: AIAnalysisData;
}

// ============================================================================
// DAILY RECOMMENDATIONS SYSTEM
// ============================================================================

export interface DailyRecommendations {
  id: string;
  userId: string;
  date: Date;
  recommendations: OutfitRecommendation[];
  weatherContext: WeatherContext;
  calendarContext?: CalendarContext;
  generatedAt: Date;
  viewedAt?: Date;
}

export interface OutfitRecommendation {
  id: string;
  dailyRecommendationId: string;
  items: WardrobeItem[];
  confidenceNote: string;
  quickActions: QuickAction[];
  confidenceScore: number;
  reasoning: string[];
  isQuickOption: boolean;
  selectedAt?: Date;
  createdAt: Date;
}

export interface QuickAction {
  type: 'wear' | 'save' | 'share';
  label: string;
  icon: string;
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

export interface WeatherContext {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed?: number;
  location: string;
  timestamp: Date;
}

export type WeatherCondition = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'snowy' 
  | 'windy' 
  | 'stormy';

export interface CalendarContext {
  events: CalendarEvent[];
  primaryEvent?: CalendarEvent;
  formalityLevel: 'casual' | 'business' | 'formal' | 'special';
}

export interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'work' | 'social' | 'personal' | 'special';
}

// ============================================================================
// INTELLIGENCE & LEARNING SYSTEM
// ============================================================================

export interface StyleProfile {
  userId: string;
  preferredColors: string[];
  preferredStyles: string[];
  bodyTypePreferences: string[];
  occasionPreferences: Record<string, number>;
  confidencePatterns: ConfidencePattern[];
  confidenceNoteStyle?: ConfidenceNoteStyle;
  lastUpdated: Date;
}

export interface ConfidencePattern {
  itemCombination: string[];
  averageRating: number;
  contextFactors: string[];
  emotionalResponse: string[];
}

export interface RecommendationContext {
  userId: string;
  date: Date;
  weather: WeatherContext;
  calendar?: CalendarContext;
  userPreferences: UserPreferences;
  styleProfile: StyleProfile;
}

// ============================================================================
// FEEDBACK SYSTEM
// ============================================================================

export interface OutfitFeedback {
  id: string;
  userId: string;
  outfitRecommendationId: string;
  confidenceRating: number; // 1-5 stars
  emotionalResponse: EmotionalResponse;
  socialFeedback?: SocialFeedback;
  occasion?: string;
  comfort: ComfortRating;
  timestamp: Date;
}

export interface EmotionalResponse {
  primary: EmotionalState;
  intensity: number; // 1-10
  additionalEmotions: string[];
}

export type EmotionalState = 
  | 'confident' 
  | 'comfortable' 
  | 'stylish' 
  | 'powerful' 
  | 'creative' 
  | 'elegant' 
  | 'playful';

export interface SocialFeedback {
  complimentsReceived: number;
  positiveReactions: string[];
  socialContext: string;
}

export interface ComfortRating {
  physical: number; // 1-5
  emotional: number; // 1-5
  confidence: number; // 1-5
}

// ============================================================================
// USER PREFERENCES & SETTINGS
// ============================================================================

export interface UserPreferences {
  userId: string;
  notificationTime: Date;
  timezone: string;
  stylePreferences: StyleProfile;
  privacySettings: PrivacySettings;
  engagementHistory: EngagementHistory;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  preferredTime: Date;
  timezone: string;
  enableWeekends: boolean;
  enableQuickOptions: boolean;
  confidenceNoteStyle: ConfidenceNoteStyle;
}

export type ConfidenceNoteStyle = 'encouraging' | 'witty' | 'poetic' | 'friendly';

export interface PrivacySettings {
  shareUsageData: boolean;
  allowLocationTracking: boolean;
  enableSocialFeatures: boolean;
  dataRetentionDays: number;
}

export interface EngagementHistory {
  totalDaysActive: number;
  streakDays: number;
  averageRating: number;
  lastActiveDate: Date;
  preferredInteractionTimes: Date[];
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface Outfit {
  id: string;
  userId: string;
  items: WardrobeItem[];
  occasion?: string;
  weatherContext: WeatherContext;
  confidenceScore: number;
  userRating?: number;
  wornDate?: Date;
  feedback?: OutfitFeedback;
  createdAt: Date;
}

// ============================================================================
// DATABASE RECORD TYPES (for Supabase)
// ============================================================================

// These interfaces represent the actual database table structures
export interface WardrobeItemRecord {
  id: string;
  user_id: string;
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  purchase_date?: string; // ISO date string
  purchase_price?: number;
  tags: string[];
  notes?: string;
  
  // Naming fields
  name?: string;
  ai_generated_name?: string;
  name_override: boolean;
  ai_analysis_data?: any; // JSONB
  
  usage_count: number;
  last_worn?: string; // ISO date string
  confidence_score: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DailyRecommendationRecord {
  id: string;
  user_id: string;
  recommendation_date: string; // ISO date string
  weather_context: any; // JSONB
  calendar_context?: any; // JSONB
  generated_at: string; // ISO timestamp
  viewed_at?: string; // ISO timestamp
}

export interface OutfitRecommendationRecord {
  id: string;
  daily_recommendation_id: string;
  item_ids: string[];
  confidence_note: string;
  confidence_score: number;
  reasoning: string[];
  is_quick_option: boolean;
  selected_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

export interface OutfitFeedbackRecord {
  id: string;
  user_id: string;
  outfit_recommendation_id: string;
  confidence_rating: number;
  emotional_response: any; // JSONB
  social_feedback?: any; // JSONB
  occasion?: string;
  comfort_rating: number;
  created_at: string; // ISO timestamp
}

export interface UserPreferencesRecord {
  user_id: string;
  notification_time: string; // TIME format
  timezone: string;
  style_preferences: any; // JSONB
  privacy_settings: any; // JSONB
  engagement_history: any; // JSONB
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================================================
// PERFORMANCE OPTIMIZATION TYPES
// ============================================================================

export interface PerformanceMetrics {
  recommendationGenerationTime: number[];
  imageProcessingTime: number[];
  databaseQueryTime: number[];
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface PerformanceSummary {
  avgRecommendationTime: number;
  avgImageProcessingTime: number;
  avgDatabaseQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface CacheConfiguration {
  dailyRecommendations: number; // 24 hours
  wardrobeData: number; // 7 days
  userPreferences: number; // 24 hours
  weatherData: number; // 2 hours
  styleProfile: number; // 24 hours
  processedImages: number; // 30 days
  performanceMetrics: number; // 1 hour
}