// Style DNA Service - AI-powered Style Pattern Recognition
// Analyzes uploaded photos to generate personalized style profiles

import { supabase } from '@/config/supabaseClient';
// import { ErrorHandler } from '../utils/ErrorHandler';
// import { intelligenceService } from './intelligenceService';
import { errorInDev, logInDev } from '@/utils/consoleSuppress';
import { ensureSupabaseOk } from '@/utils/supabaseErrorMapping';
import { isSupabaseOk, wrap } from '@/utils/supabaseResult';

import {
  CloudinaryUploadResult,
  isCloudinaryResult,
  // CloudinaryColorEntry,
} from '../types/external/cloudinary';

export interface UploadedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

interface StyleDNAAnalysis {
  dominantColors: string[];
  styleCategories: string[];
  formalityLevels: string[];
  patterns: string[];
  textures: string[];
  silhouettes: string[];
  occasions: string[];
  confidence: number;
}

interface GeneratedStyleDNA {
  userId: string;
  visualAnalysis: StyleDNAAnalysis;
  stylePersonality: {
    primary: string;
    secondary: string;
    description: string;
  };
  colorPalette: {
    primary: string[];
    accent: string[];
    neutral: string[];
  };
  stylePreferences: {
    formality: 'casual' | 'business' | 'formal' | 'mixed';
    energy: 'calm' | 'bold' | 'creative' | 'classic';
    silhouette: 'fitted' | 'relaxed' | 'structured' | 'flowing';
  };
  recommendations: {
    strengths: string[];
    suggestions: string[];
    avoidances: string[];
  };
  confidence: number;
  createdAt: string;
}

export class StyleDNAService {
  /**
   * Main method to generate Style DNA from uploaded photos
   */
  async generateStyleDNA(userId: string, photos: UploadedPhoto[]): Promise<GeneratedStyleDNA> {
    try {
      logInDev(`[StyleDNA] Generating Style DNA for user ${userId} with ${photos.length} photos`);

      if (photos.length < 3) {
        throw new Error('Minimum 3 photos required for Style DNA generation');
      }

      // Step 1: Upload photos to Supabase storage and get public URLs
      const uploadedUrls = await this.uploadPhotosToStorage(userId, photos);

      // Step 2: Analyze each photo with AI
      const photoAnalyses = await this.analyzePhotosWithAI(uploadedUrls);

      // Step 3: Aggregate analysis results
      const aggregatedAnalysis = this.aggregatePhotoAnalyses(photoAnalyses);

      // Step 4: Generate style personality and preferences
      const stylePersonality = this.generateStylePersonality(aggregatedAnalysis);
      const colorPalette = this.generateColorPalette(aggregatedAnalysis);
      const stylePreferences = this.generateStylePreferences(aggregatedAnalysis);

      // Step 5: Generate recommendations
      const recommendations = this.generateRecommendations(aggregatedAnalysis, stylePersonality);

      // Step 6: Calculate overall confidence score
      const confidence = this.calculateConfidenceScore(aggregatedAnalysis, photos.length);

      const styleDNA: GeneratedStyleDNA = {
        userId,
        visualAnalysis: aggregatedAnalysis,
        stylePersonality,
        colorPalette,
        stylePreferences,
        recommendations,
        confidence,
        createdAt: new Date().toISOString(),
      };

      // Step 7: Store Style DNA in database
      await this.storeStyleDNA(styleDNA);

      logInDev(`[StyleDNA] Successfully generated Style DNA with ${confidence}% confidence`);
      return styleDNA;
    } catch (error) {
      errorInDev(
        '[StyleDNA] Error generating Style DNA:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Upload photos to Supabase storage
   */
  private async uploadPhotosToStorage(userId: string, photos: UploadedPhoto[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (!photo) {
        continue;
      }
      const fileName = `style-dna/${userId}/${photo.id}.jpg`;

      try {
        // Convert URI to blob for upload
        const response = await fetch(photo.uri);
        const blob = await response.blob();

        // Upload to Supabase storage
        const { error } = await supabase.storage.from('wardrobe-images').upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

        if (error) {
          throw error;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('wardrobe-images').getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        logInDev(`[StyleDNA] Uploaded photo ${i + 1}/${photos.length}`);
      } catch (error) {
        errorInDev(
          `[StyleDNA] Failed to upload photo ${photo?.id}:`,
          error instanceof Error ? error : String(error),
        );
        // Continue with other photos
      }
    }

    return uploadedUrls;
  }

  /**
   * Analyze photos using AI service
   */
  private async analyzePhotosWithAI(photoUrls: string[]): Promise<StyleDNAAnalysis[]> {
    const analyses: StyleDNAAnalysis[] = [];

    for (const url of photoUrls) {
      try {
        const analysis = await this.analyzePhotoWithCloudinary(url);
        analyses.push(analysis);
      } catch (error) {
        errorInDev(
          '[StyleDNA] Failed to analyze photo:',
          error instanceof Error ? error : String(error),
        );
        // Continue with other photos
      }
    }

    return analyses;
  }

  /**
   * Analyze single photo with Cloudinary AI
   */
  private async analyzePhotoWithCloudinary(imageUrl: string): Promise<StyleDNAAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('upload_preset', 'aynamoda_preset');
      formData.append('detection', 'aws_rek_tagging');
      formData.append('colors', 'true');

      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing');
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudinary API error: ${response.status}`);
      }

      const raw: unknown = await response.json();
      // Provide a safe typed fallback instead of empty object that becomes `any`
      const fallback: CloudinaryUploadResult = {
        asset_id: undefined,
        public_id: undefined,
        width: undefined,
        height: undefined,
        format: undefined,
        resource_type: undefined,
        created_at: undefined,
        bytes: undefined,
        type: undefined,
        url: imageUrl,
        secure_url: imageUrl,
        tags: [],
        colors: [],
        predominant: undefined,
        info: undefined,
      } as unknown as CloudinaryUploadResult; // narrowed by shape usage below
      const result: CloudinaryUploadResult = isCloudinaryResult(raw) ? raw : fallback;

      // Extract style information from Cloudinary response
      const dominantColors = this.extractColorsFromCloudinary(result);
      const detectedTags = Array.isArray(result.tags) ? result.tags : [];

      return {
        dominantColors,
        styleCategories: this.categorizeStyleTags(detectedTags),
        formalityLevels: this.extractFormalityLevels(detectedTags),
        patterns: this.extractPatterns(detectedTags),
        textures: this.extractTextures(detectedTags),
        silhouettes: this.extractSilhouettes(detectedTags),
        occasions: this.extractOccasions(detectedTags),
        confidence: this.calculatePhotoConfidence(result),
      };
    } catch (error) {
      errorInDev(
        '[StyleDNA] Cloudinary analysis failed:',
        error instanceof Error ? error : String(error),
      );
      // Return default analysis
      return {
        dominantColors: [],
        styleCategories: [],
        formalityLevels: [],
        patterns: [],
        textures: [],
        silhouettes: [],
        occasions: [],
        confidence: 0.3,
      };
    }
  }

  /**
   * Aggregate multiple photo analyses into a single profile
   */
  private aggregatePhotoAnalyses(analyses: StyleDNAAnalysis[]): StyleDNAAnalysis {
    const aggregated: StyleDNAAnalysis = {
      dominantColors: [],
      styleCategories: [],
      formalityLevels: [],
      patterns: [],
      textures: [],
      silhouettes: [],
      occasions: [],
      confidence: 0,
    };

    if (analyses.length === 0) {
      return aggregated;
    }

    // Aggregate all arrays and count frequencies
    const colorFreq: Record<string, number> = {};
    const categoryFreq: Record<string, number> = {};
    const formalityFreq: Record<string, number> = {};
    const patternFreq: Record<string, number> = {};
    const textureFreq: Record<string, number> = {};
    const silhouetteFreq: Record<string, number> = {};
    const occasionFreq: Record<string, number> = {};

    let totalConfidence = 0;

    analyses.forEach((analysis) => {
      // Count frequencies
      analysis.dominantColors.forEach((color) => (colorFreq[color] = (colorFreq[color] || 0) + 1));
      analysis.styleCategories.forEach((cat) => (categoryFreq[cat] = (categoryFreq[cat] || 0) + 1));
      analysis.formalityLevels.forEach(
        (level) => (formalityFreq[level] = (formalityFreq[level] || 0) + 1),
      );
      analysis.patterns.forEach(
        (pattern) => (patternFreq[pattern] = (patternFreq[pattern] || 0) + 1),
      );
      analysis.textures.forEach(
        (texture) => (textureFreq[texture] = (textureFreq[texture] || 0) + 1),
      );
      analysis.silhouettes.forEach((sil) => (silhouetteFreq[sil] = (silhouetteFreq[sil] || 0) + 1));
      analysis.occasions.forEach((occ) => (occasionFreq[occ] = (occasionFreq[occ] || 0) + 1));

      totalConfidence += analysis.confidence;
    });

    // Get top items from each category
    aggregated.dominantColors = this.getTopItems(colorFreq, 5);
    aggregated.styleCategories = this.getTopItems(categoryFreq, 3);
    aggregated.formalityLevels = this.getTopItems(formalityFreq, 2);
    aggregated.patterns = this.getTopItems(patternFreq, 3);
    aggregated.textures = this.getTopItems(textureFreq, 3);
    aggregated.silhouettes = this.getTopItems(silhouetteFreq, 2);
    aggregated.occasions = this.getTopItems(occasionFreq, 3);
    aggregated.confidence = totalConfidence / analyses.length;

    return aggregated;
  }

  /**
   * Generate style personality from analysis
   */
  private generateStylePersonality(analysis: StyleDNAAnalysis): {
    primary: string;
    secondary: string;
    description: string;
  } {
    const { styleCategories, formalityLevels, patterns } = analysis;

    // Determine primary style personality
    let primary = 'Classic Elegance';
    let secondary = 'Refined Sophistication';
    let description =
      'You have a timeless, elegant style that emphasizes quality and sophistication.';

    // Analyze formality patterns
    const isCasual = formalityLevels.includes('casual');
    const isFormal = formalityLevels.includes('formal');
    const _isBusiness = formalityLevels.includes('business');

    // Analyze style categories
    const hasCreativeElements = styleCategories.some((cat) =>
      ['artistic', 'bohemian', 'eclectic', 'vintage'].includes(cat.toLowerCase()),
    );
    const hasMinimalElements = styleCategories.some((cat) =>
      ['minimal', 'modern', 'clean', 'simple'].includes(cat.toLowerCase()),
    );
    const hasBoldElements = patterns.some((pattern) =>
      ['bold', 'statement', 'dramatic'].includes(pattern.toLowerCase()),
    );

    if (hasCreativeElements) {
      primary = 'Creative Expression';
      secondary = 'Artistic Flair';
      description =
        'You express your creativity through unique pieces and artistic combinations that reflect your individual spirit.';
    } else if (hasMinimalElements) {
      primary = 'Modern Minimalist';
      secondary = 'Clean Sophistication';
      description =
        'You prefer clean lines and thoughtful simplicity, creating effortless elegance through carefully curated pieces.';
    } else if (hasBoldElements) {
      primary = 'Bold Confidence';
      secondary = 'Statement Making';
      description =
        'You embrace bold choices and statement pieces that command attention and express your confident personality.';
    } else if (isCasual && !isFormal) {
      primary = 'Effortless Chic';
      secondary = 'Relaxed Elegance';
      description =
        'You master the art of looking polished while feeling comfortable, blending style with everyday ease.';
    }

    return { primary, secondary, description };
  }

  /**
   * Generate color palette from analysis
   */
  private generateColorPalette(analysis: StyleDNAAnalysis): {
    primary: string[];
    accent: string[];
    neutral: string[];
  } {
    const colors = analysis.dominantColors;

    // Categorize colors
    const neutrals = colors.filter((color) =>
      ['black', 'white', 'gray', 'beige', 'navy', 'brown', 'cream'].includes(color.toLowerCase()),
    );
    const brights = colors.filter((color) =>
      ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'].includes(color.toLowerCase()),
    );
    const pastels = colors.filter(
      (color) => color.toLowerCase().includes('light') || color.toLowerCase().includes('pale'),
    );

    return {
      primary: brights.slice(0, 3),
      accent: pastels.slice(0, 2),
      neutral: neutrals.slice(0, 3),
    };
  }

  /**
   * Generate style preferences from analysis
   */
  private generateStylePreferences(analysis: StyleDNAAnalysis): {
    formality: 'casual' | 'business' | 'formal' | 'mixed';
    energy: 'calm' | 'bold' | 'creative' | 'classic';
    silhouette: 'fitted' | 'relaxed' | 'structured' | 'flowing';
  } {
    const { formalityLevels, styleCategories, silhouettes } = analysis;

    // Determine formality preference
    let formality: 'casual' | 'business' | 'formal' | 'mixed' = 'mixed';
    if (formalityLevels.includes('formal') && !formalityLevels.includes('casual')) {
      formality = 'formal';
    } else if (formalityLevels.includes('casual') && !formalityLevels.includes('formal')) {
      formality = 'casual';
    } else if (formalityLevels.includes('business')) {
      formality = 'business';
    }

    // Determine energy preference
    let energy: 'calm' | 'bold' | 'creative' | 'classic' = 'classic';
    if (
      styleCategories.some((cat) => ['bold', 'dramatic', 'statement'].includes(cat.toLowerCase()))
    ) {
      energy = 'bold';
    } else if (
      styleCategories.some((cat) => ['creative', 'artistic', 'unique'].includes(cat.toLowerCase()))
    ) {
      energy = 'creative';
    } else if (
      styleCategories.some((cat) => ['calm', 'serene', 'peaceful'].includes(cat.toLowerCase()))
    ) {
      energy = 'calm';
    }

    // Determine silhouette preference
    let silhouette: 'fitted' | 'relaxed' | 'structured' | 'flowing' = 'fitted';
    if (silhouettes.includes('relaxed') || silhouettes.includes('loose')) {
      silhouette = 'relaxed';
    } else if (silhouettes.includes('structured') || silhouettes.includes('tailored')) {
      silhouette = 'structured';
    } else if (silhouettes.includes('flowing') || silhouettes.includes('fluid')) {
      silhouette = 'flowing';
    }

    return { formality, energy, silhouette };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    analysis: StyleDNAAnalysis,
    personality: { primary: string; secondary: string; description: string },
  ): { strengths: string[]; suggestions: string[]; avoidances: string[] } {
    const strengths: string[] = [];
    const suggestions: string[] = [];
    const avoidances: string[] = [];

    // Generate strengths based on analysis
    if (analysis.dominantColors.length > 3) {
      strengths.push('You have a great eye for color coordination');
    }
    if (analysis.styleCategories.includes('classic')) {
      strengths.push('Your timeless style choices create lasting elegance');
    }
    if (analysis.confidence > 0.7) {
      strengths.push('You consistently choose pieces that work well together');
    }

    // Generate suggestions based on personality
    if (personality.primary === 'Creative Expression') {
      suggestions.push('Try mixing textures to enhance your artistic flair');
      suggestions.push('Experiment with statement accessories to amplify your creativity');
    } else if (personality.primary === 'Modern Minimalist') {
      suggestions.push('Focus on quality basics in neutral tones');
      suggestions.push('Add one statement piece to elevate simple outfits');
    } else if (personality.primary === 'Bold Confidence') {
      suggestions.push('Balance bold pieces with classic foundations');
      suggestions.push('Use color blocking to create striking combinations');
    }

    // Generate avoidances based on analysis
    if (
      analysis.formalityLevels.includes('casual') &&
      !analysis.formalityLevels.includes('formal')
    ) {
      avoidances.push('Overly formal pieces that feel uncomfortable');
    }
    if (analysis.patterns.length === 0) {
      avoidances.push('Too many patterns at once - start with one statement pattern');
    }

    return { strengths, suggestions, avoidances };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(analysis: StyleDNAAnalysis, photoCount: number): number {
    let confidence = analysis.confidence;

    // Boost confidence based on photo count
    if (photoCount >= 7) {
      confidence += 0.1;
    }
    if (photoCount >= 10) {
      confidence += 0.1;
    }

    // Boost confidence based on consistency
    if (analysis.dominantColors.length >= 3) {
      confidence += 0.05;
    }
    if (analysis.styleCategories.length >= 2) {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  /**
   * Store Style DNA in database
   */
  private async storeStyleDNA(styleDNA: GeneratedStyleDNA): Promise<void> {
    try {
      const res = await wrap(
        async () =>
          await supabase.from('style_dna_profiles').upsert({
            user_id: styleDNA.userId,
            visual_analysis: styleDNA.visualAnalysis,
            style_personality: styleDNA.stylePersonality,
            color_palette: styleDNA.colorPalette,
            style_preferences: styleDNA.stylePreferences,
            recommendations: styleDNA.recommendations,
            confidence: styleDNA.confidence,
            created_at: styleDNA.createdAt,
            updated_at: new Date().toISOString(),
          }),
      );
      ensureSupabaseOk(res, { action: 'storeStyleDNA' });

      logInDev(`[StyleDNA] Stored Style DNA profile for user ${styleDNA.userId}`);
    } catch (error) {
      errorInDev(
        '[StyleDNA] Failed to store Style DNA:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  // Helper methods for extracting style information
  private extractColorsFromCloudinary(result: CloudinaryUploadResult): string[] {
    const colors: string[] = [];
    if (Array.isArray(result.colors)) {
      for (const entry of result.colors) {
        if (typeof entry === 'string') {
          colors.push(entry);
          continue;
        }
        const ce = entry;
        if (ce.name && typeof ce.name === 'string') {
          colors.push(ce.name);
        } else if (ce.value && typeof ce.value === 'string') {
          colors.push(ce.value);
        } else if (ce[0] && typeof ce[0] === 'string') {
          colors.push(ce[0]);
        }
      }
    }
    return colors.slice(0, 5);
  }

  private categorizeStyleTags(tags: string[]): string[] {
    const styleKeywords = {
      classic: ['classic', 'timeless', 'traditional', 'elegant'],
      modern: ['modern', 'contemporary', 'sleek', 'minimal'],
      bohemian: ['bohemian', 'boho', 'free-spirited', 'artistic'],
      edgy: ['edgy', 'rock', 'punk', 'alternative'],
      romantic: ['romantic', 'feminine', 'soft', 'delicate'],
      sporty: ['sporty', 'athletic', 'active', 'casual'],
    };

    const categories: string[] = [];

    Object.entries(styleKeywords).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => tags.some((tag) => tag.toLowerCase().includes(keyword)))) {
        categories.push(category);
      }
    });

    return categories;
  }

  private extractFormalityLevels(tags: string[]): string[] {
    const formalityKeywords = {
      casual: ['casual', 'relaxed', 'everyday', 'comfortable'],
      business: ['business', 'professional', 'work', 'office'],
      formal: ['formal', 'dressy', 'elegant', 'sophisticated'],
      evening: ['evening', 'party', 'cocktail', 'gala'],
    };

    const levels: string[] = [];

    Object.entries(formalityKeywords).forEach(([level, keywords]) => {
      if (keywords.some((keyword) => tags.some((tag) => tag.toLowerCase().includes(keyword)))) {
        levels.push(level);
      }
    });

    return levels;
  }

  private extractPatterns(tags: string[]): string[] {
    const patternKeywords = ['stripe', 'floral', 'geometric', 'polka', 'plaid', 'leopard', 'solid'];
    return tags.filter((tag) =>
      patternKeywords.some((pattern) => tag.toLowerCase().includes(pattern)),
    );
  }

  private extractTextures(tags: string[]): string[] {
    const textureKeywords = ['silk', 'cotton', 'wool', 'denim', 'leather', 'lace', 'knit', 'satin'];
    return tags.filter((tag) =>
      textureKeywords.some((texture) => tag.toLowerCase().includes(texture)),
    );
  }

  private extractSilhouettes(tags: string[]): string[] {
    const silhouetteKeywords = [
      'fitted',
      'loose',
      'flowing',
      'structured',
      'oversized',
      'tailored',
    ];
    return tags.filter((tag) =>
      silhouetteKeywords.some((silhouette) => tag.toLowerCase().includes(silhouette)),
    );
  }

  private extractOccasions(tags: string[]): string[] {
    const occasionKeywords = ['work', 'party', 'casual', 'date', 'travel', 'weekend', 'formal'];
    return tags.filter((tag) =>
      occasionKeywords.some((occasion) => tag.toLowerCase().includes(occasion)),
    );
  }

  private calculatePhotoConfidence(result: CloudinaryUploadResult): number {
    const tagCount = Array.isArray(result.tags) ? result.tags.length : 0;
    const colorCount = Array.isArray(result.colors) ? result.colors.length : 0;

    let confidence = 0.5; // Base confidence

    if (tagCount > 5) {
      confidence += 0.2;
    }
    if (tagCount > 10) {
      confidence += 0.1;
    }
    if (colorCount > 3) {
      confidence += 0.1;
    }
    if (colorCount > 5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 0.9);
  }

  private getTopItems(frequency: Record<string, number>, limit: number): string[] {
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * Retrieve existing Style DNA for a user
   */
  async getStyleDNA(userId: string): Promise<GeneratedStyleDNA | null> {
    interface StyleDNARow {
      user_id: string;
      visual_analysis: StyleDNAAnalysis;
      style_personality: GeneratedStyleDNA['stylePersonality'];
      color_palette: GeneratedStyleDNA['colorPalette'];
      style_preferences: GeneratedStyleDNA['stylePreferences'];
      recommendations: GeneratedStyleDNA['recommendations'];
      confidence: number;
      created_at: string;
    }

    try {
      const res = await wrap(
        async () =>
          await supabase
            .from('style_dna_profiles')
            .select(
              'user_id, visual_analysis, style_personality, color_palette, style_preferences, recommendations, confidence, created_at',
            )
            .eq('user_id', userId)
            .single(),
      );
      if (!isSupabaseOk(res)) {
        return null;
      }
      const row = res.data as StyleDNARow;
      return {
        userId: row.user_id,
        visualAnalysis: row.visual_analysis,
        stylePersonality: row.style_personality,
        colorPalette: row.color_palette,
        stylePreferences: row.style_preferences,
        recommendations: row.recommendations,
        confidence: row.confidence,
        createdAt: row.created_at,
      };
    } catch (error) {
      errorInDev(
        '[StyleDNA] Error retrieving Style DNA:',
        error instanceof Error ? error : String(error),
      );
      return null;
    }
  }
}

export const styleDNAService = new StyleDNAService();
