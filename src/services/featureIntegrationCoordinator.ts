// Feature Integration Coordinator - Cohesive User Experience Management
// Coordinates all app features to work seamlessly together

import { supabase } from '@/config/supabaseClient';
// import { notificationService } from './notificationService'; // reserved for future cross-feature notifications
import { errorInDev, logInDev } from '@/utils/consoleSuppress';

import { performanceOptimizationService } from './performanceOptimizationService';
import { styleDNAService } from './styleDNAService';
import { userJourneyTestingService } from './userJourneyTestingService';
import { wardrobeService } from './wardrobeService';

// -------------------- Domain Interfaces (local) --------------------
export interface WardrobeItemMinimal {
  id?: string;
  color?: string;
  category?: string;
  brand?: string;
  price?: number;
}

export interface StylePreferences {
  preferredColors?: string[];
  preferredCategories?: string[];
  styleTypes?: string[];
  priceRange?: { min: number; max: number };
}

export interface DiscoveryPreferences {
  colors: string[];
  categories: string[];
  styles: string[];
  priceRange?: { min: number; max: number };
}

export interface DiscoveryInteraction {
  action: string; // 'like' | 'dislike' | extension
  item: WardrobeItemMinimal;
}

interface StyleProfileUpdateInput {
  colors?: string[];
  categories?: string[];
  brands?: string[];
  likedColors?: string[];
  dislikedColors?: string[];
  likedCategories?: string[];
  dislikedCategories?: string[];
}

interface StyleDNAServiceAdapter {
  getUserStyleProfile: () => Promise<StylePreferences | null>;
  updateStyleProfile: (data: StyleProfileUpdateInput) => Promise<void>;
  learnFromInteractions: (data: StyleProfileUpdateInput) => Promise<void>;
}

export interface FeatureState {
  wardrobe: {
    initialized: boolean;
    itemCount: number;
    lastSync: Date | null;
  };
  styleAnalysis: {
    profileComplete: boolean;
    lastAnalysis: Date | null;
    preferences: StylePreferences | null;
  };
  aynaMirror: {
    available: boolean;
    lastSession: Date | null;
    feedbackCount: number;
  };
  discovery: {
    initialized: boolean;
    preferences: DiscoveryPreferences | null;
    lastBrowse: Date | null;
  };
  profile: {
    complete: boolean;
    lastUpdate: Date | null;
    preferences: unknown; // TODO: introduce typed user profile model
  };
}

export interface IntegrationHealth {
  overall: 'healthy' | 'warning' | 'critical';
  features: Record<string, 'healthy' | 'warning' | 'critical'>;
  dataConsistency: boolean;
  performanceScore: number;
  userExperienceScore: number;
}

export interface CrossFeatureData {
  userId: string;
  userProfile: CoordinatorUserProfile | null;
  wardrobeItems: WardrobeItemMinimal[];
  stylePreferences: StylePreferences | null;
  outfitHistory: unknown[];
  discoveryPreferences: DiscoveryPreferences | null;
  mirrorFeedback: unknown[];
  notifications: unknown[];
}

// Narrow user profile shape for coordinator usage (decoupled from broader domain user profile)
interface CoordinatorUserProfile {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  preferences: unknown;
  updatedAt: string | null;
  createdAt: string | null;
}

class FeatureIntegrationCoordinator {
  private featureState: FeatureState;
  private crossFeatureData: CrossFeatureData | null = null;
  private integrationListeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private isInitialized = false;
  // Cached adapter for styleDNA safe calls
  private styleDNA: StyleDNAServiceAdapter | null = null;

  constructor() {
    this.featureState = this.getInitialFeatureState();
  }

  // Helper method declarations (implemented via prototype at file end to avoid clutter)
  // Using private signatures so TypeScript recognizes their existence.
  // Implementations appended after class definition.
  private toWardrobeItem(input: unknown): WardrobeItemMinimal | null {
    if (!input || typeof input !== 'object') {
      return null;
    }
    const obj = input as Record<string, unknown>;
    const item: WardrobeItemMinimal = {};
    if (typeof obj.id === 'string') {
      item.id = obj.id;
    }
    if (typeof obj.color === 'string') {
      item.color = obj.color;
    }
    if (typeof obj.category === 'string') {
      item.category = obj.category;
    }
    if (typeof obj.brand === 'string') {
      item.brand = obj.brand;
    }
    if (typeof obj.price === 'number' && isFinite(obj.price)) {
      item.price = obj.price;
    }
    return Object.keys(item).length ? item : null;
  }
  private safeStylePreferences(input: unknown): StylePreferences | null {
    if (!input || typeof input !== 'object') {
      return null;
    }
    const obj = input as Record<string, unknown>;
    const sp: StylePreferences = {};
    if (
      Array.isArray(obj.preferredColors) &&
      obj.preferredColors.every((c) => typeof c === 'string')
    ) {
      sp.preferredColors = [...obj.preferredColors];
    }
    if (
      Array.isArray(obj.preferredCategories) &&
      obj.preferredCategories.every((c) => typeof c === 'string')
    ) {
      sp.preferredCategories = [...obj.preferredCategories];
    }
    if (Array.isArray(obj.styleTypes) && obj.styleTypes.every((c) => typeof c === 'string')) {
      sp.styleTypes = [...obj.styleTypes];
    }
    const pr = (obj as { priceRange?: unknown }).priceRange;
    if (
      pr &&
      typeof pr === 'object' &&
      typeof (pr as { min?: unknown }).min === 'number' &&
      typeof (pr as { max?: unknown }).max === 'number'
    ) {
      const { min, max } = pr as { min: number; max: number };
      sp.priceRange = { min, max };
    }
    return Object.keys(sp).length ? sp : null;
  }
  private toDiscoveryInteraction(input: unknown): DiscoveryInteraction | null {
    if (!input || typeof input !== 'object') {
      return null;
    }
    const obj = input as Record<string, unknown>;
    if (!obj.item || typeof obj.item !== 'object') {
      return null;
    }
    const item = this.toWardrobeItem(obj.item);
    if (!item) {
      return null;
    }
    const action = typeof obj.action === 'string' ? obj.action : 'unknown';
    return { action, item };
  }

  private getStyleDNA(): StyleDNAServiceAdapter {
    if (this.styleDNA) {
      return this.styleDNA;
    }
    // Build a lightweight adapter with runtime guards
    const raw = styleDNAService as unknown as Partial<StyleDNAServiceAdapter>;
    const adapter: StyleDNAServiceAdapter = {
      getUserStyleProfile: async () => {
        try {
          if (typeof raw.getUserStyleProfile === 'function') {
            const r = await raw.getUserStyleProfile();
            return r ?? null;
          }
        } catch {}
        return null;
      },
      updateStyleProfile: async (data) => {
        try {
          if (typeof raw.updateStyleProfile === 'function') {
            await raw.updateStyleProfile(data);
          }
        } catch {}
      },
      learnFromInteractions: async (data) => {
        try {
          if (typeof raw.learnFromInteractions === 'function') {
            await raw.learnFromInteractions(data);
          }
        } catch {}
      },
    };
    this.styleDNA = adapter;
    return adapter;
  }

  // Initialize the coordinator and sync all features
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logInDev('🔄 Feature Integration Coordinator already initialized');
      return;
    }

    try {
      logInDev('🚀 Initializing Feature Integration Coordinator...');

      // Initialize performance monitoring
      // Optional performance monitoring start (non-blocking if absent)
      const maybeStart = (
        performanceOptimizationService as unknown as {
          startMonitoring?: () => void | Promise<void>;
        }
      ).startMonitoring;
      if (typeof maybeStart === 'function') {
        const possible = maybeStart();
        if (possible && typeof (possible as Promise<unknown>).then === 'function') {
          await possible; // true promise
        }
      }

      // Load user data and sync features
      await this.loadCrossFeatureData();
      await this.syncAllFeatures();

      // Set up feature listeners
      this.setupFeatureListeners();

      // Validate integration health
      const health = this.checkIntegrationHealth();
      logInDev('🏥 Integration Health:', health.overall);

      this.isInitialized = true;
      logInDev('✅ Feature Integration Coordinator initialized successfully');
    } catch (error) {
      errorInDev(
        '❌ Failed to initialize Feature Integration Coordinator:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  // Load cross-feature data from all services
  private async loadCrossFeatureData(): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      const userId = session.user.id;

      // Load data from all features
      const styleDNA = this.getStyleDNA();
      const settled = await Promise.allSettled([
        wardrobeService.getItems(),
        styleDNA.getUserStyleProfile(),
        this.loadUserProfile(userId),
      ]);

      const wardrobeItemsRaw =
        settled[0].status === 'fulfilled' && Array.isArray(settled[0].value)
          ? settled[0].value
          : [];
      const stylePreferencesRaw = settled[1].status === 'fulfilled' ? settled[1].value : null;
      const userProfile: CoordinatorUserProfile | null =
        settled[2].status === 'fulfilled' ? settled[2].value : null;

      const wardrobeItems: WardrobeItemMinimal[] = (wardrobeItemsRaw as unknown[])
        .map((w) => this.toWardrobeItem(w))
        .filter((w): w is WardrobeItemMinimal => !!w);
      const stylePreferences = this.safeStylePreferences(stylePreferencesRaw);

      this.crossFeatureData = {
        userId,
        userProfile,
        wardrobeItems,
        stylePreferences,
        outfitHistory: [],
        discoveryPreferences: null,
        mirrorFeedback: [],
        notifications: [],
      };
    } catch (error) {
      errorInDev(
        'Failed to load cross-feature data:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  // Sync all features to ensure consistency
  private async syncAllFeatures(): Promise<void> {
    try {
      logInDev('🔄 Syncing all features...');

      if (!this.crossFeatureData) {
        throw new Error('Cross-feature data not loaded');
      }

      // Sync wardrobe
      await this.syncWardrobeFeature();

      // Sync style analysis
      this.syncStyleAnalysisFeature();

      // Sync discovery preferences
      this.syncDiscoveryFeature();

      // Sync AYNA Mirror
      this.syncAynaMirrorFeature();

      // Sync profile
      this.syncProfileFeature();

      logInDev('✅ All features synced successfully');
    } catch (error) {
      errorInDev('Failed to sync features:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  // Sync wardrobe feature
  private async syncWardrobeFeature(): Promise<void> {
    try {
      const wardrobeItems = this.crossFeatureData?.wardrobeItems || [];

      // Initialize wardrobe if needed
      if (wardrobeItems.length === 0) {
        await wardrobeService.initializeWardrobe();
      }

      // Update feature state
      this.featureState.wardrobe = {
        initialized: true,
        itemCount: wardrobeItems.length,
        lastSync: new Date(),
      };

      this.notifyFeatureListeners('wardrobe', this.featureState.wardrobe);
    } catch (error) {
      errorInDev(
        'Failed to sync wardrobe feature:',
        error instanceof Error ? error : String(error),
      );
      this.featureState.wardrobe.initialized = false;
    }
  }

  // Sync style analysis feature
  private syncStyleAnalysisFeature(): void {
    try {
      const stylePreferences = this.crossFeatureData?.stylePreferences;

      this.featureState.styleAnalysis = {
        profileComplete: !!stylePreferences,
        lastAnalysis: stylePreferences ? new Date() : null,
        preferences: stylePreferences || null,
      };

      this.notifyFeatureListeners('styleAnalysis', this.featureState.styleAnalysis);
    } catch (error) {
      errorInDev(
        'Failed to sync style analysis feature:',
        error instanceof Error ? error : String(error),
      );
      this.featureState.styleAnalysis.profileComplete = false;
    }
  }

  // Sync discovery feature
  private syncDiscoveryFeature(): void {
    try {
      const stylePreferences = this.crossFeatureData?.stylePreferences || null;
      const discoveryPreferences = this.deriveDiscoveryPreferences(stylePreferences);

      this.featureState.discovery = {
        initialized: true,
        preferences: discoveryPreferences,
        lastBrowse: null,
      };

      this.notifyFeatureListeners('discovery', this.featureState.discovery);
    } catch (error) {
      errorInDev(
        'Failed to sync discovery feature:',
        error instanceof Error ? error : String(error),
      );
      this.featureState.discovery.initialized = false;
    }
  }

  // Sync AYNA Mirror feature
  private syncAynaMirrorFeature(): void {
    try {
      this.featureState.aynaMirror = {
        available: true,
        lastSession: null,
        feedbackCount: this.crossFeatureData?.mirrorFeedback?.length || 0,
      };

      this.notifyFeatureListeners('aynaMirror', this.featureState.aynaMirror);
    } catch (error) {
      errorInDev(
        'Failed to sync AYNA Mirror feature:',
        error instanceof Error ? error : String(error),
      );
      this.featureState.aynaMirror.available = false;
    }
  }

  // Sync profile feature
  private syncProfileFeature(): void {
    try {
      const userProfile = this.crossFeatureData?.userProfile;

      this.featureState.profile = {
        complete: !!userProfile,
        lastUpdate: userProfile ? new Date() : null,
        preferences: userProfile,
      };

      this.notifyFeatureListeners('profile', this.featureState.profile);
    } catch (error) {
      errorInDev('Failed to sync profile feature:', error instanceof Error ? error : String(error));
      this.featureState.profile.complete = false;
    }
  }

  // Set up listeners for feature updates
  private setupFeatureListeners(): void {
    // Listen for wardrobe updates
    this.addFeatureListener('wardrobe', (data: unknown) => {
      void this.handleWardrobeUpdate(data as { items?: unknown[] });
    });

    // Listen for style analysis updates
    this.addFeatureListener('styleAnalysis', (data: unknown) => {
      this.handleStyleAnalysisUpdate(data as { preferences?: unknown });
    });

    // Listen for discovery updates
    this.addFeatureListener('discovery', (data: unknown) => {
      void this.handleDiscoveryUpdate(data as { interactions?: unknown[] });
    });
  }

  // Handle wardrobe updates and propagate to other features
  private async handleWardrobeUpdate(data: { items?: unknown[] }): Promise<void> {
    try {
      // Update cross-feature data
      if (this.crossFeatureData) {
        const items = Array.isArray(data.items)
          ? data.items
              .map((i) => this.toWardrobeItem(i))
              .filter((i): i is WardrobeItemMinimal => !!i)
          : [];
        this.crossFeatureData.wardrobeItems = items;
      }

      // Update style analysis based on new wardrobe items
      if (Array.isArray(data.items) && data.items.length > 0) {
        const items = data.items
          .map((i) => this.toWardrobeItem(i))
          .filter((i): i is WardrobeItemMinimal => !!i);
        await this.updateStyleAnalysisFromWardrobe(items);
      }

      // Update discovery preferences
      const discItems = Array.isArray(data.items)
        ? data.items.map((i) => this.toWardrobeItem(i)).filter((i): i is WardrobeItemMinimal => !!i)
        : [];
      this.updateDiscoveryFromWardrobe(discItems);
    } catch (error) {
      errorInDev(
        'Failed to handle wardrobe update:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Handle style analysis updates
  private handleStyleAnalysisUpdate(data: { preferences?: unknown }): void {
    try {
      // Update cross-feature data
      if (this.crossFeatureData) {
        this.crossFeatureData.stylePreferences = this.safeStylePreferences(data.preferences);
      }

      // Update discovery preferences based on style analysis
      const discoveryPreferences = this.deriveDiscoveryPreferences(
        this.crossFeatureData?.stylePreferences || null,
      );
      this.featureState.discovery.preferences = discoveryPreferences;
    } catch (error) {
      errorInDev(
        'Failed to handle style analysis update:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Handle discovery updates
  private async handleDiscoveryUpdate(data: { interactions?: unknown[] }): Promise<void> {
    try {
      // Update last browse time
      this.featureState.discovery.lastBrowse = new Date();

      // Learn from user interactions
      if (Array.isArray(data.interactions)) {
        const interactions = data.interactions
          .map((i) => this.toDiscoveryInteraction(i))
          .filter((i): i is DiscoveryInteraction => !!i);
        if (interactions.length) {
          await this.learnFromDiscoveryInteractions(interactions);
        }
      }
    } catch (error) {
      errorInDev(
        'Failed to handle discovery update:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Update style analysis based on wardrobe items
  private async updateStyleAnalysisFromWardrobe(items: WardrobeItemMinimal[]): Promise<void> {
    try {
      const styleData = {
        colors: this.extractColorsFromItems(items),
        categories: this.extractCategoriesFromItems(items),
        brands: this.extractBrandsFromItems(items),
      };

      await this.getStyleDNA().updateStyleProfile(styleData);
    } catch (error) {
      errorInDev(
        'Failed to update style analysis from wardrobe:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Update discovery preferences from wardrobe
  private updateDiscoveryFromWardrobe(items: WardrobeItemMinimal[]): void {
    try {
      const preferences: DiscoveryPreferences = {
        colors: this.extractColorsFromItems(items),
        categories: this.extractCategoriesFromItems(items),
        styles: [],
        priceRange: this.derivePriceRangeFromItems(items),
      };
      this.featureState.discovery.preferences = preferences;
    } catch (error) {
      errorInDev(
        'Failed to update discovery from wardrobe:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Learn from discovery interactions
  private async learnFromDiscoveryInteractions(
    interactions: DiscoveryInteraction[],
  ): Promise<void> {
    try {
      const likedItems = interactions.filter((i) => i.action === 'like');
      const dislikedItems = interactions.filter((i) => i.action === 'dislike');

      // Update style preferences based on interactions
      const learningData = {
        likedColors: this.extractColorsFromItems(likedItems.map((i) => i.item)),
        dislikedColors: this.extractColorsFromItems(dislikedItems.map((i) => i.item)),
        likedCategories: this.extractCategoriesFromItems(likedItems.map((i) => i.item)),
        dislikedCategories: this.extractCategoriesFromItems(dislikedItems.map((i) => i.item)),
      };

      await this.getStyleDNA().learnFromInteractions(learningData);
    } catch (error) {
      errorInDev(
        'Failed to learn from discovery interactions:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // Derive discovery preferences from style preferences
  private deriveDiscoveryPreferences(
    stylePreferences: StylePreferences | null,
  ): DiscoveryPreferences {
    if (!stylePreferences) {
      return {
        colors: ['black', 'white', 'navy'],
        categories: ['tops', 'bottoms'],
        styles: ['casual', 'modern'],
        priceRange: { min: 50, max: 200 },
      };
    }
    return {
      colors: stylePreferences.preferredColors?.length
        ? stylePreferences.preferredColors
        : ['black', 'white'],
      categories: stylePreferences.preferredCategories?.length
        ? stylePreferences.preferredCategories
        : ['tops'],
      styles: stylePreferences.styleTypes?.length ? stylePreferences.styleTypes : ['casual'],
      priceRange: stylePreferences.priceRange || { min: 50, max: 200 },
    };
  }

  // Extract colors from items
  private extractColorsFromItems<T extends { color?: string }>(items: T[]): string[] {
    return [...new Set(items.map((item) => item.color).filter((c): c is string => !!c))];
  }

  // Extract categories from items
  private extractCategoriesFromItems<T extends { category?: string }>(items: T[]): string[] {
    return [...new Set(items.map((item) => item.category).filter((c): c is string => !!c))];
  }

  // Extract brands from items
  private extractBrandsFromItems<T extends { brand?: string }>(items: T[]): string[] {
    return [...new Set(items.map((item) => item.brand).filter((b): b is string => !!b))];
  }

  // Derive price range from items
  private derivePriceRangeFromItems<T extends { price?: number }>(
    items: T[],
  ): { min: number; max: number } {
    const prices = items
      .map((item) => item.price)
      .filter((price): price is number => typeof price === 'number' && isFinite(price));

    if (prices.length === 0) {
      return { min: 50, max: 200 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  // Check integration health
  checkIntegrationHealth(): IntegrationHealth {
    try {
      const featureHealths: Record<string, 'healthy' | 'warning' | 'critical'> = {};

      // Check each feature health
      featureHealths.wardrobe = this.featureState.wardrobe.initialized ? 'healthy' : 'critical';
      featureHealths.styleAnalysis = this.featureState.styleAnalysis.profileComplete
        ? 'healthy'
        : 'warning';
      featureHealths.aynaMirror = this.featureState.aynaMirror.available ? 'healthy' : 'warning';
      featureHealths.discovery = this.featureState.discovery.initialized ? 'healthy' : 'warning';
      featureHealths.profile = this.featureState.profile.complete ? 'healthy' : 'warning';

      // Check data consistency
      const dataConsistency = this.validateDataConsistency();

      // Get performance score
      const performanceMetrics = performanceOptimizationService.getPerformanceMetrics();
      const performanceScore = this.calculatePerformanceScore(performanceMetrics);

      // Calculate user experience score
      const userExperienceScore = this.calculateUserExperienceScore(
        featureHealths,
        dataConsistency,
      );

      // Determine overall health
      const criticalCount = Object.values(featureHealths).filter((h) => h === 'critical').length;
      const warningCount = Object.values(featureHealths).filter((h) => h === 'warning').length;

      let overall: 'healthy' | 'warning' | 'critical';
      if (criticalCount > 0) {
        overall = 'critical';
      } else if (warningCount > 2) {
        overall = 'warning';
      } else {
        overall = 'healthy';
      }

      return {
        overall,
        features: featureHealths,
        dataConsistency,
        performanceScore,
        userExperienceScore,
      };
    } catch (error) {
      errorInDev(
        'Failed to check integration health:',
        error instanceof Error ? error : String(error),
      );
      return {
        overall: 'critical',
        features: {},
        dataConsistency: false,
        performanceScore: 0,
        userExperienceScore: 0,
      };
    }
  }

  // Validate data consistency across features
  private validateDataConsistency(): boolean {
    try {
      if (!this.crossFeatureData) {
        return false;
      }
      const wardrobeColors = this.extractColorsFromItems(this.crossFeatureData.wardrobeItems);
      const styleColors = this.crossFeatureData.stylePreferences?.preferredColors || [];
      const hasColorOverlap = wardrobeColors.some((color) => styleColors.includes(color));
      const discoveryColors = this.featureState.discovery.preferences?.colors || [];
      const hasDiscoveryAlignment = styleColors.some((color) => discoveryColors.includes(color));
      return hasColorOverlap || hasDiscoveryAlignment || wardrobeColors.length === 0;
    } catch (error) {
      errorInDev(
        'Failed to validate data consistency:',
        error instanceof Error ? error : String(error),
      );
      return false;
    }
  }

  // Calculate performance score
  private calculatePerformanceScore(
    metrics: ReturnType<typeof performanceOptimizationService.getPerformanceMetrics>,
  ): number {
    try {
      const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      const rec = avg(metrics.recommendationGenerationTime);
      const img = avg(metrics.imageProcessingTime);
      const db = avg(metrics.databaseQueryTime);
      // Lower times & error rate good; higher cacheHitRate good
      const timeScore = 100 - Math.min(100, (rec + img + db) / 30); // heuristic
      const cacheScore = Math.min(100, metrics.cacheHitRate * 100);
      const errorPenalty = Math.min(40, metrics.errorRate * 100);
      return Math.round(Math.max(0, timeScore * 0.5 + cacheScore * 0.4 - errorPenalty * 0.3));
    } catch {
      return 0;
    }
  }

  // Calculate user experience score
  private calculateUserExperienceScore(
    featureHealths: Record<string, string>,
    dataConsistency: boolean,
  ): number {
    try {
      const healthyCount = Object.values(featureHealths).filter((h) => h === 'healthy').length;
      const totalFeatures = Object.keys(featureHealths).length;

      const featureScore = (healthyCount / totalFeatures) * 80;
      const consistencyScore = dataConsistency ? 20 : 0;

      return Math.round(featureScore + consistencyScore);
    } catch (error) {
      return 0;
    }
  }

  // Add feature listener
  addFeatureListener(feature: string, callback: (data: unknown) => void): void {
    if (!this.integrationListeners.has(feature)) {
      this.integrationListeners.set(feature, []);
    }
    this.integrationListeners.get(feature)!.push(callback);
  }

  // Notify feature listeners
  private notifyFeatureListeners(feature: string, data: unknown): void {
    const listeners = this.integrationListeners.get(feature) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        errorInDev(
          `Feature listener error for ${feature}:`,
          error instanceof Error ? error : String(error),
        );
      }
    });
  }

  // Load user profile with narrow typing and defensive parsing
  private async loadUserProfile(userId: string): Promise<CoordinatorUserProfile | null> {
    interface RawUserProfile {
      user_id: string;
      display_name?: string | null;
      avatar_url?: string | null;
      preferences?: unknown;
      updated_at?: string | null;
      created_at?: string | null;
    }
    const guard = (row: unknown): row is RawUserProfile =>
      !!row &&
      typeof row === 'object' &&
      'user_id' in row &&
      typeof (row as Record<string, unknown>).user_id === 'string';
    const { fetchSingle } = await import('../utils/supabaseQueryHelpers');
    const result = await fetchSingle<RawUserProfile>(
      'user_profiles',
      (q) => q.eq('user_id', userId),
      guard,
    );
    if (!result.ok) {
      const errorResult = result as { ok: false; error: Error };
      const errorMessage =
        errorResult.error instanceof Error ? errorResult.error.message : String(errorResult.error);
      errorInDev('Failed to load user profile:', errorMessage);
      return null;
    }
    const data = result.data;
    if (!data) {
      return null;
    }
    return {
      userId: data.user_id,
      displayName: typeof data.display_name === 'string' ? data.display_name : null,
      avatarUrl: typeof data.avatar_url === 'string' ? data.avatar_url : null,
      preferences: data.preferences ?? null,
      updatedAt: data.updated_at || null,
      createdAt: data.created_at || null,
    };
  }

  // Get initial feature state
  private getInitialFeatureState(): FeatureState {
    return {
      wardrobe: {
        initialized: false,
        itemCount: 0,
        lastSync: null,
      },
      styleAnalysis: {
        profileComplete: false,
        lastAnalysis: null,
        preferences: null,
      },
      aynaMirror: {
        available: false,
        lastSession: null,
        feedbackCount: 0,
      },
      discovery: {
        initialized: false,
        preferences: null,
        lastBrowse: null,
      },
      profile: {
        complete: false,
        lastUpdate: null,
        preferences: null,
      },
    };
  }

  // Public getters
  getFeatureState(): FeatureState {
    return { ...this.featureState };
  }

  getCrossFeatureData(): CrossFeatureData | null {
    return this.crossFeatureData ? { ...this.crossFeatureData } : null;
  }

  isFeatureIntegrationHealthy(): boolean {
    return (
      this.isInitialized &&
      this.featureState.wardrobe.initialized &&
      this.featureState.profile.complete
    );
  }

  // Force resync all features
  async resyncAllFeatures(): Promise<void> {
    logInDev('🔄 Force resyncing all features...');
    await this.loadCrossFeatureData();
    await this.syncAllFeatures();
    logInDev('✅ Force resync completed');
  }

  // Run integration tests
  async runIntegrationTests(): Promise<{ results: unknown; summary: unknown }> {
    logInDev('🧪 Running integration tests...');
    const results = await userJourneyTestingService.runAllJourneyTests();
    const summary = userJourneyTestingService.getTestResultsSummary();

    logInDev('📊 Integration test results:', summary);
    return { results, summary };
  }
}

export const featureIntegrationCoordinator = new FeatureIntegrationCoordinator();
export default featureIntegrationCoordinator;
