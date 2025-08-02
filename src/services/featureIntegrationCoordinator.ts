// Feature Integration Coordinator - Cohesive User Experience Management
// Coordinates all app features to work seamlessly together

import { supabase } from '@/config/supabaseClient';
import { wardrobeService } from './wardrobeService';
import { styleDNAService } from './styleDNAService';
import { performanceOptimizationService } from './performanceOptimizationService';
import { navigationIntegrationService } from './navigationIntegrationService';
import { userJourneyTestingService } from './userJourneyTestingService';
import { notificationService } from './notificationService';

export interface FeatureState {
  wardrobe: {
    initialized: boolean;
    itemCount: number;
    lastSync: Date | null;
  };
  styleAnalysis: {
    profileComplete: boolean;
    lastAnalysis: Date | null;
    preferences: any;
  };
  aynaMirror: {
    available: boolean;
    lastSession: Date | null;
    feedbackCount: number;
  };
  discovery: {
    initialized: boolean;
    preferences: any;
    lastBrowse: Date | null;
  };
  profile: {
    complete: boolean;
    lastUpdate: Date | null;
    preferences: any;
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
  userProfile: any;
  wardrobeItems: any[];
  stylePreferences: any;
  outfitHistory: any[];
  discoveryPreferences: any;
  mirrorFeedback: any[];
  notifications: any[];
}

class FeatureIntegrationCoordinator {
  private featureState: FeatureState;
  private crossFeatureData: CrossFeatureData | null = null;
  private integrationListeners: Map<string, Function[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.featureState = this.getInitialFeatureState();
  }

  // Initialize the coordinator and sync all features
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Feature Integration Coordinator already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Feature Integration Coordinator...');
      
      // Initialize performance monitoring
      await performanceOptimizationService.startMonitoring();
      
      // Load user data and sync features
      await this.loadCrossFeatureData();
      await this.syncAllFeatures();
      
      // Set up feature listeners
      this.setupFeatureListeners();
      
      // Validate integration health
      const health = await this.checkIntegrationHealth();
      console.log('🏥 Integration Health:', health.overall);
      
      this.isInitialized = true;
      console.log('✅ Feature Integration Coordinator initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Feature Integration Coordinator:', error);
      throw error;
    }
  }

  // Load cross-feature data from all services
  private async loadCrossFeatureData(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const userId = session.user.id;
      
      // Load data from all features
      const [wardrobeItems, stylePreferences, userProfile] = await Promise.all([
        wardrobeService.getItems().catch(() => []),
        styleDNAService.getUserStyleProfile().catch(() => null),
        this.loadUserProfile(userId).catch(() => null)
      ]);

      this.crossFeatureData = {
        userId,
        userProfile,
        wardrobeItems: wardrobeItems || [],
        stylePreferences,
        outfitHistory: [],
        discoveryPreferences: null,
        mirrorFeedback: [],
        notifications: []
      };

      // Update navigation service with loaded data
      navigationIntegrationService.setUserJourneyData({
        userProfile,
        wardrobeItems,
        stylePreferences
      });

    } catch (error) {
      console.error('Failed to load cross-feature data:', error);
      throw error;
    }
  }

  // Sync all features to ensure consistency
  private async syncAllFeatures(): Promise<void> {
    try {
      console.log('🔄 Syncing all features...');
      
      if (!this.crossFeatureData) {
        throw new Error('Cross-feature data not loaded');
      }

      // Sync wardrobe
      await this.syncWardrobeFeature();
      
      // Sync style analysis
      await this.syncStyleAnalysisFeature();
      
      // Sync discovery preferences
      await this.syncDiscoveryFeature();
      
      // Sync AYNA Mirror
      await this.syncAynaMirrorFeature();
      
      // Sync profile
      await this.syncProfileFeature();
      
      console.log('✅ All features synced successfully');
      
    } catch (error) {
      console.error('Failed to sync features:', error);
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
        lastSync: new Date()
      };
      
      this.notifyFeatureListeners('wardrobe', this.featureState.wardrobe);
      
    } catch (error) {
      console.error('Failed to sync wardrobe feature:', error);
      this.featureState.wardrobe.initialized = false;
    }
  }

  // Sync style analysis feature
  private async syncStyleAnalysisFeature(): Promise<void> {
    try {
      const stylePreferences = this.crossFeatureData?.stylePreferences;
      
      this.featureState.styleAnalysis = {
        profileComplete: !!stylePreferences,
        lastAnalysis: stylePreferences ? new Date() : null,
        preferences: stylePreferences
      };
      
      this.notifyFeatureListeners('styleAnalysis', this.featureState.styleAnalysis);
      
    } catch (error) {
      console.error('Failed to sync style analysis feature:', error);
      this.featureState.styleAnalysis.profileComplete = false;
    }
  }

  // Sync discovery feature
  private async syncDiscoveryFeature(): Promise<void> {
    try {
      const stylePreferences = this.crossFeatureData?.stylePreferences;
      const discoveryPreferences = this.deriveDiscoveryPreferences(stylePreferences);
      
      this.featureState.discovery = {
        initialized: true,
        preferences: discoveryPreferences,
        lastBrowse: null
      };
      
      this.notifyFeatureListeners('discovery', this.featureState.discovery);
      
    } catch (error) {
      console.error('Failed to sync discovery feature:', error);
      this.featureState.discovery.initialized = false;
    }
  }

  // Sync AYNA Mirror feature
  private async syncAynaMirrorFeature(): Promise<void> {
    try {
      this.featureState.aynaMirror = {
        available: true,
        lastSession: null,
        feedbackCount: this.crossFeatureData?.mirrorFeedback?.length || 0
      };
      
      this.notifyFeatureListeners('aynaMirror', this.featureState.aynaMirror);
      
    } catch (error) {
      console.error('Failed to sync AYNA Mirror feature:', error);
      this.featureState.aynaMirror.available = false;
    }
  }

  // Sync profile feature
  private async syncProfileFeature(): Promise<void> {
    try {
      const userProfile = this.crossFeatureData?.userProfile;
      
      this.featureState.profile = {
        complete: !!userProfile,
        lastUpdate: userProfile ? new Date() : null,
        preferences: userProfile
      };
      
      this.notifyFeatureListeners('profile', this.featureState.profile);
      
    } catch (error) {
      console.error('Failed to sync profile feature:', error);
      this.featureState.profile.complete = false;
    }
  }

  // Set up listeners for feature updates
  private setupFeatureListeners(): void {
    // Listen for wardrobe updates
    this.addFeatureListener('wardrobe', (data) => {
      this.handleWardrobeUpdate(data);
    });
    
    // Listen for style analysis updates
    this.addFeatureListener('styleAnalysis', (data) => {
      this.handleStyleAnalysisUpdate(data);
    });
    
    // Listen for discovery updates
    this.addFeatureListener('discovery', (data) => {
      this.handleDiscoveryUpdate(data);
    });
  }

  // Handle wardrobe updates and propagate to other features
  private async handleWardrobeUpdate(data: any): Promise<void> {
    try {
      // Update cross-feature data
      if (this.crossFeatureData) {
        this.crossFeatureData.wardrobeItems = data.items || [];
      }
      
      // Update style analysis based on new wardrobe items
      if (data.items && data.items.length > 0) {
        await this.updateStyleAnalysisFromWardrobe(data.items);
      }
      
      // Update discovery preferences
      await this.updateDiscoveryFromWardrobe(data.items);
      
    } catch (error) {
      console.error('Failed to handle wardrobe update:', error);
    }
  }

  // Handle style analysis updates
  private async handleStyleAnalysisUpdate(data: any): Promise<void> {
    try {
      // Update cross-feature data
      if (this.crossFeatureData) {
        this.crossFeatureData.stylePreferences = data.preferences;
      }
      
      // Update discovery preferences based on style analysis
      const discoveryPreferences = this.deriveDiscoveryPreferences(data.preferences);
      this.featureState.discovery.preferences = discoveryPreferences;
      
    } catch (error) {
      console.error('Failed to handle style analysis update:', error);
    }
  }

  // Handle discovery updates
  private async handleDiscoveryUpdate(data: any): Promise<void> {
    try {
      // Update last browse time
      this.featureState.discovery.lastBrowse = new Date();
      
      // Learn from user interactions
      if (data.interactions) {
        await this.learnFromDiscoveryInteractions(data.interactions);
      }
      
    } catch (error) {
      console.error('Failed to handle discovery update:', error);
    }
  }

  // Update style analysis based on wardrobe items
  private async updateStyleAnalysisFromWardrobe(items: any[]): Promise<void> {
    try {
      const styleData = {
        colors: this.extractColorsFromItems(items),
        categories: this.extractCategoriesFromItems(items),
        brands: this.extractBrandsFromItems(items)
      };
      
      await styleDNAService.updateStyleProfile(styleData);
      
    } catch (error) {
      console.error('Failed to update style analysis from wardrobe:', error);
    }
  }

  // Update discovery preferences from wardrobe
  private async updateDiscoveryFromWardrobe(items: any[]): Promise<void> {
    try {
      const preferences = {
        preferredColors: this.extractColorsFromItems(items),
        preferredCategories: this.extractCategoriesFromItems(items),
        preferredBrands: this.extractBrandsFromItems(items),
        priceRange: this.derivePriceRangeFromItems(items)
      };
      
      this.featureState.discovery.preferences = preferences;
      
    } catch (error) {
      console.error('Failed to update discovery from wardrobe:', error);
    }
  }

  // Learn from discovery interactions
  private async learnFromDiscoveryInteractions(interactions: any[]): Promise<void> {
    try {
      const likedItems = interactions.filter(i => i.action === 'like');
      const dislikedItems = interactions.filter(i => i.action === 'dislike');
      
      // Update style preferences based on interactions
      const learningData = {
        likedColors: this.extractColorsFromItems(likedItems.map(i => i.item)),
        dislikedColors: this.extractColorsFromItems(dislikedItems.map(i => i.item)),
        likedCategories: this.extractCategoriesFromItems(likedItems.map(i => i.item)),
        dislikedCategories: this.extractCategoriesFromItems(dislikedItems.map(i => i.item))
      };
      
      await styleDNAService.learnFromInteractions(learningData);
      
    } catch (error) {
      console.error('Failed to learn from discovery interactions:', error);
    }
  }

  // Derive discovery preferences from style preferences
  private deriveDiscoveryPreferences(stylePreferences: any): any {
    if (!stylePreferences) {
      return {
        colors: ['black', 'white', 'navy'],
        categories: ['tops', 'bottoms'],
        styles: ['casual', 'modern']
      };
    }
    
    return {
      colors: stylePreferences.preferredColors || ['black', 'white'],
      categories: stylePreferences.preferredCategories || ['tops'],
      styles: stylePreferences.styleTypes || ['casual'],
      priceRange: stylePreferences.priceRange || { min: 50, max: 200 }
    };
  }

  // Extract colors from items
  private extractColorsFromItems(items: any[]): string[] {
    return [...new Set(items.map(item => item.color).filter(Boolean))];
  }

  // Extract categories from items
  private extractCategoriesFromItems(items: any[]): string[] {
    return [...new Set(items.map(item => item.category).filter(Boolean))];
  }

  // Extract brands from items
  private extractBrandsFromItems(items: any[]): string[] {
    return [...new Set(items.map(item => item.brand).filter(Boolean))];
  }

  // Derive price range from items
  private derivePriceRangeFromItems(items: any[]): { min: number; max: number } {
    const prices = items.map(item => item.price).filter(price => typeof price === 'number');
    
    if (prices.length === 0) {
      return { min: 50, max: 200 };
    }
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // Check integration health
  async checkIntegrationHealth(): Promise<IntegrationHealth> {
    try {
      const featureHealths: Record<string, 'healthy' | 'warning' | 'critical'> = {};
      
      // Check each feature health
      featureHealths.wardrobe = this.featureState.wardrobe.initialized ? 'healthy' : 'critical';
      featureHealths.styleAnalysis = this.featureState.styleAnalysis.profileComplete ? 'healthy' : 'warning';
      featureHealths.aynaMirror = this.featureState.aynaMirror.available ? 'healthy' : 'warning';
      featureHealths.discovery = this.featureState.discovery.initialized ? 'healthy' : 'warning';
      featureHealths.profile = this.featureState.profile.complete ? 'healthy' : 'warning';
      
      // Check data consistency
      const dataConsistency = await this.validateDataConsistency();
      
      // Get performance score
      const performanceMetrics = await performanceOptimizationService.getPerformanceMetrics();
      const performanceScore = this.calculatePerformanceScore(performanceMetrics);
      
      // Calculate user experience score
      const userExperienceScore = this.calculateUserExperienceScore(featureHealths, dataConsistency);
      
      // Determine overall health
      const criticalCount = Object.values(featureHealths).filter(h => h === 'critical').length;
      const warningCount = Object.values(featureHealths).filter(h => h === 'warning').length;
      
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
        userExperienceScore
      };
      
    } catch (error) {
      console.error('Failed to check integration health:', error);
      return {
        overall: 'critical',
        features: {},
        dataConsistency: false,
        performanceScore: 0,
        userExperienceScore: 0
      };
    }
  }

  // Validate data consistency across features
  private async validateDataConsistency(): Promise<boolean> {
    try {
      if (!this.crossFeatureData) {
        return false;
      }
      
      // Check if style preferences match wardrobe items
      const wardrobeColors = this.extractColorsFromItems(this.crossFeatureData.wardrobeItems);
      const styleColors = this.crossFeatureData.stylePreferences?.preferredColors || [];
      
      // Check if there's some overlap
      const hasColorOverlap = wardrobeColors.some(color => styleColors.includes(color));
      
      // Check if discovery preferences are derived from style preferences
      const discoveryColors = this.featureState.discovery.preferences?.colors || [];
      const hasDiscoveryAlignment = styleColors.some((color: string) => discoveryColors.includes(color));
      
      return hasColorOverlap || hasDiscoveryAlignment || wardrobeColors.length === 0;
      
    } catch (error) {
      console.error('Failed to validate data consistency:', error);
      return false;
    }
  }

  // Calculate performance score
  private calculatePerformanceScore(metrics: any): number {
    try {
      const navigationScore = Math.max(0, 100 - (metrics.averageNavigationTime || 0) / 10);
      const memoryScore = Math.max(0, 100 - (metrics.memoryUsage || 0));
      const renderScore = Math.max(0, 100 - (metrics.renderTime || 0) * 2);
      
      return Math.round((navigationScore + memoryScore + renderScore) / 3);
    } catch (error) {
      return 0;
    }
  }

  // Calculate user experience score
  private calculateUserExperienceScore(featureHealths: Record<string, string>, dataConsistency: boolean): number {
    try {
      const healthyCount = Object.values(featureHealths).filter(h => h === 'healthy').length;
      const totalFeatures = Object.keys(featureHealths).length;
      
      const featureScore = (healthyCount / totalFeatures) * 80;
      const consistencyScore = dataConsistency ? 20 : 0;
      
      return Math.round(featureScore + consistencyScore);
    } catch (error) {
      return 0;
    }
  }

  // Add feature listener
  addFeatureListener(feature: string, callback: Function): void {
    if (!this.integrationListeners.has(feature)) {
      this.integrationListeners.set(feature, []);
    }
    this.integrationListeners.get(feature)!.push(callback);
  }

  // Notify feature listeners
  private notifyFeatureListeners(feature: string, data: any): void {
    const listeners = this.integrationListeners.get(feature) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Feature listener error for ${feature}:`, error);
      }
    });
  }

  // Load user profile
  private async loadUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  // Get initial feature state
  private getInitialFeatureState(): FeatureState {
    return {
      wardrobe: {
        initialized: false,
        itemCount: 0,
        lastSync: null
      },
      styleAnalysis: {
        profileComplete: false,
        lastAnalysis: null,
        preferences: null
      },
      aynaMirror: {
        available: false,
        lastSession: null,
        feedbackCount: 0
      },
      discovery: {
        initialized: false,
        preferences: null,
        lastBrowse: null
      },
      profile: {
        complete: false,
        lastUpdate: null,
        preferences: null
      }
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
    return this.isInitialized && 
           this.featureState.wardrobe.initialized &&
           this.featureState.profile.complete;
  }

  // Force resync all features
  async resyncAllFeatures(): Promise<void> {
    console.log('🔄 Force resyncing all features...');
    await this.loadCrossFeatureData();
    await this.syncAllFeatures();
    console.log('✅ Force resync completed');
  }

  // Run integration tests
  async runIntegrationTests(): Promise<any> {
    console.log('🧪 Running integration tests...');
    const results = await userJourneyTestingService.runAllJourneyTests();
    const summary = userJourneyTestingService.getTestResultsSummary();
    
    console.log('📊 Integration test results:', summary);
    return { results, summary };
  }
}

export const featureIntegrationCoordinator = new FeatureIntegrationCoordinator();
export default featureIntegrationCoordinator;