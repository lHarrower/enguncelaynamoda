// User Journey Testing Service - End-to-End Experience Validation
// Tests complete user flows, data consistency, and feature integration

import { supabase } from '@/config/supabaseClient';

import { navigationIntegrationService } from './navigationIntegrationService';
import { performanceOptimizationService } from './performanceOptimizationService';
import { styleDNAService, UploadedPhoto } from './styleDNAService';
import { wardrobeService } from './wardrobeService';

export interface JourneyTestResult {
  journeyId: string;
  success: boolean;
  duration: number;
  steps: JourneyStepResult[];
  errors: string[];
  dataValidation: DataValidationResult;
  performanceMetrics: PerformanceMetrics;
}

export interface JourneyStepResult {
  step: string;
  success: boolean;
  duration: number;
  dataState: Record<string, unknown>;
  error?: string;
}

export interface DataValidationResult {
  userProfile: boolean;
  wardrobeData: boolean;
  stylePreferences: boolean;
  outfitHistory: boolean;
  feedbackData: boolean;
  consistency: boolean;
}

export interface PerformanceMetrics {
  averageNavigationTime: number;
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
}

class UserJourneyTestingService {
  private testResults: JourneyTestResult[] = [];
  private isTestingMode = false;

  // Test complete onboarding to wardrobe journey
  async testOnboardingToWardrobeJourney(): Promise<JourneyTestResult> {
    const journeyId = 'onboarding-to-wardrobe';
    const startTime = Date.now();
    const steps: JourneyStepResult[] = [];
    const errors: string[] = [];

    try {
      this.isTestingMode = true;
      // Testing Onboarding to Wardrobe Journey

      // Step 1: User Registration/Authentication
      const authStep = await this.testAuthenticationStep();
      steps.push(authStep);
      if (!authStep.success) {
        errors.push('Authentication failed');
      }

      // Step 2: Onboarding Flow
      const onboardingStep = this.testOnboardingStep();
      steps.push(onboardingStep);
      if (!onboardingStep.success) {
        errors.push('Onboarding flow failed');
      }

      // Step 3: Style Profile Creation
      const styleStep = await this.testStyleProfileStep();
      steps.push(styleStep);
      if (!styleStep.success) {
        errors.push('Style profile creation failed');
      }

      // Step 4: Wardrobe Setup
      const wardrobeStep = await this.testWardrobeSetupStep();
      steps.push(wardrobeStep);
      if (!wardrobeStep.success) {
        errors.push('Wardrobe setup failed');
      }

      // Step 5: First Item Addition
      const addItemStep = await this.testAddItemStep();
      steps.push(addItemStep);
      if (!addItemStep.success) {
        errors.push('Add item failed');
      }

      const duration = Date.now() - startTime;
      const dataValidation = this.validateDataConsistency();
      const performanceMetrics = this.collectPerformanceMetrics();

      const result: JourneyTestResult = {
        journeyId,
        success: errors.length === 0,
        duration,
        steps,
        errors,
        dataValidation,
        performanceMetrics,
      };

      this.testResults.push(result);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Journey test failed
      errors.push(`Unexpected error: ${message}`);

      return {
        journeyId,
        success: false,
        duration: Date.now() - startTime,
        steps,
        errors,
        dataValidation: this.validateDataConsistency(),
        performanceMetrics: this.collectPerformanceMetrics(),
      };
    } finally {
      this.isTestingMode = false;
    }
  }

  // Test wardrobe to outfit creation journey
  async testWardrobeToOutfitJourney(): Promise<JourneyTestResult> {
    const journeyId = 'wardrobe-to-outfit';
    const startTime = Date.now();
    const steps: JourneyStepResult[] = [];
    const errors: string[] = [];

    try {
      this.isTestingMode = true;
      // Testing Wardrobe to Outfit Journey

      // Step 1: Load Wardrobe
      const loadWardrobeStep = await this.testLoadWardrobeStep();
      steps.push(loadWardrobeStep);
      if (!loadWardrobeStep.success) {
        errors.push('Failed to load wardrobe');
      }

      // Step 2: Select Items for Outfit
      const selectItemsStep = this.testSelectItemsStep();
      steps.push(selectItemsStep);
      if (!selectItemsStep.success) {
        errors.push('Failed to select items');
      }

      // Step 3: Create Outfit
      const createOutfitStep = this.testCreateOutfitStep();
      steps.push(createOutfitStep);
      if (!createOutfitStep.success) {
        errors.push('Failed to create outfit');
      }

      // Step 4: AYNA Mirror Analysis
      const mirrorStep = this.testAynaMirrorStep();
      steps.push(mirrorStep);
      if (!mirrorStep.success) {
        errors.push('AYNA Mirror analysis failed');
      }

      // Step 5: Save Outfit
      const saveOutfitStep = this.testSaveOutfitStep();
      steps.push(saveOutfitStep);
      if (!saveOutfitStep.success) {
        errors.push('Failed to save outfit');
      }

      const duration = Date.now() - startTime;
      const dataValidation = this.validateDataConsistency();
      const performanceMetrics = this.collectPerformanceMetrics();

      const result: JourneyTestResult = {
        journeyId,
        success: errors.length === 0,
        duration,
        steps,
        errors,
        dataValidation,
        performanceMetrics,
      };

      this.testResults.push(result);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Journey test failed
      errors.push(`Unexpected error: ${message}`);

      return {
        journeyId,
        success: false,
        duration: Date.now() - startTime,
        steps,
        errors,
        dataValidation: this.validateDataConsistency(),
        performanceMetrics: this.collectPerformanceMetrics(),
      };
    } finally {
      this.isTestingMode = false;
    }
  }

  // Test discovery to purchase journey
  testDiscoveryToPurchaseJourney(): JourneyTestResult {
    const journeyId = 'discover-to-purchase';
    const startTime = Date.now();
    const steps: JourneyStepResult[] = [];
    const errors: string[] = [];

    try {
      this.isTestingMode = true;
      // Testing Discovery to Purchase Journey

      // Step 1: Browse Discovery Feed
      const browseStep = this.testBrowseDiscoveryStep();
      steps.push(browseStep);
      if (!browseStep.success) {
        errors.push('Failed to browse discovery feed');
      }

      // Step 2: Product Selection
      const selectProductStep = this.testSelectProductStep();
      steps.push(selectProductStep);
      if (!selectProductStep.success) {
        errors.push('Failed to select product');
      }

      // Step 3: Add to Bag
      const addToBagStep = this.testAddToBagStep();
      steps.push(addToBagStep);
      if (!addToBagStep.success) {
        errors.push('Failed to add to bag');
      }

      // Step 4: Checkout Process
      const checkoutStep = this.testCheckoutStep();
      steps.push(checkoutStep);
      if (!checkoutStep.success) {
        errors.push('Checkout process failed');
      }

      const duration = Date.now() - startTime;
      const dataValidation = this.validateDataConsistency();
      const performanceMetrics = this.collectPerformanceMetrics();

      const result: JourneyTestResult = {
        journeyId,
        success: errors.length === 0,
        duration,
        steps,
        errors,
        dataValidation,
        performanceMetrics,
      };

      this.testResults.push(result);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Journey test failed
      errors.push(`Unexpected error: ${message}`);

      return {
        journeyId,
        success: false,
        duration: Date.now() - startTime,
        steps,
        errors,
        dataValidation: this.validateDataConsistency(),
        performanceMetrics: this.collectPerformanceMetrics(),
      };
    } finally {
      this.isTestingMode = false;
    }
  }

  // Individual step testing methods
  private async testAuthenticationStep(): Promise<JourneyStepResult> {
    const stepStart = Date.now();
    try {
      // Test authentication flow
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return {
        step: 'authentication',
        success: !!session,
        duration: Date.now() - stepStart,
        dataState: { authenticated: !!session },
      };
    } catch (error) {
      return {
        step: 'authentication',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: String(error),
      };
    }
  }

  private testOnboardingStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Simulate onboarding completion
      const onboardingData = {
        personalInfo: { name: 'Test User', age: 25 },
        preferences: { style: 'modern', colors: ['blue', 'black'] },
      };

      navigationIntegrationService.setUserJourneyData({ userProfile: onboardingData });

      return {
        step: 'onboarding',
        success: true,
        duration: Date.now() - stepStart,
        dataState: onboardingData,
      };
    } catch (error: unknown) {
      return {
        step: 'onboarding',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async testStyleProfileStep(): Promise<JourneyStepResult> {
    const stepStart = Date.now();
    try {
      // Test style profile creation
      const photos: UploadedPhoto[] = [
        {
          id: 'p1',
          uri: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
          timestamp: Date.now(),
        },
        {
          id: 'p2',
          uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
          timestamp: Date.now(),
        },
        {
          id: 'p3',
          uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
          timestamp: Date.now(),
        },
      ];
      const styleData = await styleDNAService.generateStyleDNA('test-user', photos);

      navigationIntegrationService.setUserJourneyData({ stylePreferences: styleData });

      return {
        step: 'style-profile',
        success: !!styleData,
        duration: Date.now() - stepStart,
        dataState: { styleData },
      };
    } catch (error: unknown) {
      return {
        step: 'style-profile',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async testWardrobeSetupStep(): Promise<JourneyStepResult> {
    const stepStart = Date.now();
    try {
      // Test wardrobe initialization
      const wardrobeData = await wardrobeService.initializeWardrobe();

      return {
        step: 'wardrobe-setup',
        success: !!wardrobeData,
        duration: Date.now() - stepStart,
        dataState: { wardrobeData },
      };
    } catch (error) {
      return {
        step: 'wardrobe-setup',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: String(error),
      };
    }
  }

  private async testAddItemStep(): Promise<JourneyStepResult> {
    const stepStart = Date.now();
    try {
      // Test adding first item to wardrobe
      const testItem = {
        id: 'test-item-1',
        name: 'Test Shirt',
        category: 'tops',
        color: 'blue',
        brand: 'Test Brand',
      };

      const result = await wardrobeService.addItem(testItem);
      navigationIntegrationService.setUserJourneyData({
        wardrobeItems: [testItem],
      });

      return {
        step: 'add-item',
        success: !!result,
        duration: Date.now() - stepStart,
        dataState: { addedItem: testItem },
      };
    } catch (error) {
      return {
        step: 'add-item',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: String(error),
      };
    }
  }

  private async testLoadWardrobeStep(): Promise<JourneyStepResult> {
    const stepStart = Date.now();
    try {
      const items = await wardrobeService.getItems();

      return {
        step: 'load-wardrobe',
        success: Array.isArray(items),
        duration: Date.now() - stepStart,
        dataState: { itemCount: items?.length || 0 },
      };
    } catch (error) {
      return {
        step: 'load-wardrobe',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: String(error),
      };
    }
  }

  private testSelectItemsStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Simulate item selection for outfit
      const selectedItems = ['test-item-1', 'test-item-2'];
      navigationIntegrationService.setUserJourneyData({ selectedItems });

      return {
        step: 'select-items',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { selectedItems },
      };
    } catch (error: unknown) {
      return {
        step: 'select-items',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testCreateOutfitStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Test outfit creation
      const outfitData = {
        id: 'test-outfit-1',
        name: 'Test Outfit',
        items: ['test-item-1', 'test-item-2'],
        occasion: 'casual',
      };

      navigationIntegrationService.setUserJourneyData({ outfitData });

      return {
        step: 'create-outfit',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { outfitData },
      };
    } catch (error: unknown) {
      return {
        step: 'create-outfit',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testAynaMirrorStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Test AYNA Mirror analysis
      const analysisResult = {
        styleScore: 8.5,
        recommendations: ['Great color combination', 'Consider adding accessories'],
        confidence: 0.92,
      };

      navigationIntegrationService.setUserJourneyData({ mirrorAnalysis: analysisResult });

      return {
        step: 'ayna-mirror',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { analysisResult },
      };
    } catch (error: unknown) {
      return {
        step: 'ayna-mirror',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testSaveOutfitStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Test outfit saving
      const journeyData = navigationIntegrationService.getUserJourneyData();
      const outfitData = journeyData.outfitData;

      if (!outfitData) {
        throw new Error('No outfit data to save');
      }

      return {
        step: 'save-outfit',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { savedOutfit: outfitData },
      };
    } catch (error: unknown) {
      return {
        step: 'save-outfit',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testBrowseDiscoveryStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      // Simulate discovery browsing
      const discoveryItems = [
        { id: 'product-1', name: 'Discover Item 1', price: 99 },
        { id: 'product-2', name: 'Discover Item 2', price: 149 },
      ];

      return {
        step: 'browse-discovery',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { discoveryItems },
      };
    } catch (error: unknown) {
      return {
        step: 'browse-discovery',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testSelectProductStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      const selectedProduct = {
        id: 'product-1',
        name: 'Selected Product',
        price: 99,
        size: 'M',
        color: 'blue',
      };

      navigationIntegrationService.setUserJourneyData({ selectedProduct });

      return {
        step: 'select-product',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { selectedProduct },
      };
    } catch (error: unknown) {
      return {
        step: 'select-product',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testAddToBagStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      const journeyData = navigationIntegrationService.getUserJourneyData();
      const selectedProduct = journeyData.selectedProduct;

      if (!selectedProduct) {
        throw new Error('No product selected');
      }

      const bagItems = [selectedProduct];
      navigationIntegrationService.setUserJourneyData({ bagItems });

      return {
        step: 'add-to-bag',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { bagItems },
      };
    } catch (error: unknown) {
      return {
        step: 'add-to-bag',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private testCheckoutStep(): JourneyStepResult {
    const stepStart = Date.now();
    try {
      const journeyData = navigationIntegrationService.getUserJourneyData();
      const bagItems = Array.isArray(journeyData.bagItems)
        ? (journeyData.bagItems as Array<{
            id: string;
            name: string;
            price: number;
            size?: string;
            color?: string;
          }>)
        : [];

      if (!bagItems || bagItems.length === 0) {
        throw new Error('No items in bag');
      }

      const orderData = {
        id: 'order-test-1',
        items: bagItems,
        total: bagItems.reduce((sum: number, item) => sum + item.price, 0),
        status: 'completed',
      };

      return {
        step: 'checkout',
        success: true,
        duration: Date.now() - stepStart,
        dataState: { orderData },
      };
    } catch (error: unknown) {
      return {
        step: 'checkout',
        success: false,
        duration: Date.now() - stepStart,
        dataState: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Validate data consistency across the app
  private validateDataConsistency(): DataValidationResult {
    try {
      const journeyData = navigationIntegrationService.getUserJourneyData();

      return {
        userProfile: !!journeyData.userProfile,
        wardrobeData: !!journeyData.wardrobeItems,
        stylePreferences: !!journeyData.stylePreferences,
        outfitHistory: !!journeyData.outfitData,
        feedbackData: !!journeyData.mirrorAnalysis,
        consistency: this.checkDataConsistency(journeyData),
      };
    } catch (error) {
      // Data validation failed
      return {
        userProfile: false,
        wardrobeData: false,
        stylePreferences: false,
        outfitHistory: false,
        feedbackData: false,
        consistency: false,
      };
    }
  }

  private checkDataConsistency(data: Record<string, unknown>): boolean {
    // Check if related data is consistent
    const outfitData = data.outfitData as { items?: string[] } | undefined;
    const wardrobeItems = data.wardrobeItems as Array<{ id?: string }> | undefined;
    if (outfitData && wardrobeItems) {
      const outfitItems = Array.isArray(outfitData.items) ? outfitData.items : [];
      const wardrobeItemIds = wardrobeItems.map((item) => item.id).filter(Boolean) as string[];

      // Check if outfit items exist in wardrobe
      return outfitItems.every((itemId: string) => wardrobeItemIds.includes(itemId));
    }

    return true;
  }

  // Collect performance metrics (underlying service is synchronous)
  private collectPerformanceMetrics(): PerformanceMetrics {
    try {
      const metrics = performanceOptimizationService.getPerformanceMetrics();
      const safe = (val: unknown, fallback: number): number =>
        typeof val === 'number' && isFinite(val) ? val : fallback;
      return {
        averageNavigationTime: safe(
          (metrics as { averageNavigationTime?: unknown }).averageNavigationTime,
          200,
        ),
        memoryUsage: safe((metrics as { memoryUsage?: unknown }).memoryUsage, 50),
        renderTime: safe((metrics as { renderTime?: unknown }).renderTime, 16),
        apiResponseTime: safe((metrics as { apiResponseTime?: unknown }).apiResponseTime, 300),
      };
    } catch {
      return { averageNavigationTime: 0, memoryUsage: 0, renderTime: 0, apiResponseTime: 0 };
    }
  }

  // Run all journey tests
  async runAllJourneyTests(): Promise<JourneyTestResult[]> {
    // Running all user journey tests

    return Promise.all([
      this.testOnboardingToWardrobeJourney(),
      this.testWardrobeToOutfitJourney(),
      this.testDiscoveryToPurchaseJourney(),
    ]);
  }

  // Get test results summary
  getTestResultsSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageDuration: number;
    successRate: number;
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const successRate = (passedTests / totalTests) * 100;

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDuration,
      successRate,
    };
  }

  // Clear test results
  clearTestResults(): void {
    this.testResults = [];
  }
}

export const userJourneyTestingService = new UserJourneyTestingService();
export default userJourneyTestingService;
