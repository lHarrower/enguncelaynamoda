/**
 * Image Cache Manager
 * Advanced caching system for optimized image loading and storage
 */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

import { PerformanceOptimizationService } from '../services/performanceOptimizationService';
import { errorInDev, logInDev, warnInDev } from '../utils/consoleSuppress';
import { secureStorage } from '../utils/secureStorage';

interface CacheEntry {
  /** Original image URL */
  url: string;
  /** Local file path */
  localPath: string;
  /** Cache timestamp */
  timestamp: number;
  /** File size in bytes */
  size: number;
  /** Image dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Cache priority (higher = keep longer) */
  priority: number;
  /** Access count for LRU */
  accessCount: number;
  /** Last access timestamp */
  lastAccess: number;
  /** Image format (webp, jpg, png) */
  format: string;
  /** Compression quality used */
  quality?: number;
}

interface CacheConfig {
  /** Maximum cache size in MB */
  maxCacheSize: number;
  /** Maximum age in milliseconds */
  maxAge: number;
  /** Maximum number of cached items */
  maxItems: number;
  /** Enable WebP format */
  enableWebP: boolean;
  /** Default image quality (0-100) */
  defaultQuality: number;
  /** Preload priority images */
  preloadPriority: boolean;
}

interface CacheStats {
  /** Total cache size in bytes */
  totalSize: number;
  /** Number of cached items */
  itemCount: number;
  /** Cache hit rate percentage */
  hitRate: number;
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Last cleanup timestamp */
  lastCleanup: number;
}

interface ImageCacheOptions {
  priority?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpg' | 'png';
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cacheDir: string;
  private isInitialized = false;
  private cleanupInProgress = false;

  private constructor() {
    this.config = {
      maxCacheSize: 100, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxItems: 500,
      enableWebP: Platform.OS === 'android',
      defaultQuality: 80,
      preloadPriority: true,
    };

    this.stats = {
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      hits: 0,
      misses: 0,
      lastCleanup: Date.now(),
    };

    this.cacheDir = `${RNFS.CachesDirectoryPath}/images`;
  }

  public static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * Initialize the cache manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create cache directory
      await this.ensureCacheDirectory();

      // Load existing cache entries
      await this.loadCacheIndex();

      // Validate cache entries
      await this.validateCacheEntries();

      // Schedule periodic cleanup
      this.scheduleCleanup();

      this.isInitialized = true;
      logInDev('ImageCacheManager initialized successfully');
    } catch (error) {
      errorInDev('Failed to initialize ImageCacheManager:', String(error));
      throw error;
    }
  }

  /**
   * Get cached image or download and cache it
   */
  public async getImage(
    url: string,
    options: {
      priority?: number;
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {},
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cacheKey = this.generateCacheKey(url, options);
    const cachedEntry = this.cache.get(cacheKey);

    // Check if cached version exists and is valid
    if (cachedEntry && (await this.isCacheEntryValid(cachedEntry))) {
      // Update access statistics
      cachedEntry.accessCount++;
      cachedEntry.lastAccess = Date.now();
      this.stats.hits++;
      this.updateHitRate();

      return cachedEntry.localPath;
    }

    // Cache miss - download and cache the image
    this.stats.misses++;
    this.updateHitRate();

    return await this.downloadAndCache(url, options);
  }

  /**
   * Preload images for better performance
   */
  public async preloadImages(
    urls: string[],
    options: {
      priority?: number;
      quality?: number;
      maxConcurrent?: number;
    } = {},
  ): Promise<void> {
    const { maxConcurrent = 3 } = options;
    const chunks = this.chunkArray(urls, maxConcurrent);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((url) =>
          this.getImage(url, { ...options, priority: 10 }).catch((error) => {
            warnInDev(`Failed to preload image: ${url}`, String(error));
          }),
        ),
      );
    }
  }

  /**
   * Clear specific image from cache
   */
  public async clearImage(url: string): Promise<void> {
    const cacheKey = this.generateCacheKey(url);
    const entry = this.cache.get(cacheKey);

    if (entry) {
      try {
        await RNFS.unlink(entry.localPath);
        this.cache.delete(cacheKey);
        this.stats.totalSize -= entry.size;
        this.stats.itemCount--;
        await this.saveCacheIndex();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        warnInDev('Failed to clear cached image:', err);
      }
    }
  }

  /**
   * Clear all cached images
   */
  public async clearAll(): Promise<void> {
    try {
      await RNFS.unlink(this.cacheDir);
      await this.ensureCacheDirectory();
      this.cache.clear();
      this.stats.totalSize = 0;
      this.stats.itemCount = 0;
      await this.saveCacheIndex();
    } catch (error) {
      errorInDev('Failed to clear cache:', String(error));
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update cache configuration
   */
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Manual cache cleanup
   */
  public async cleanup(): Promise<void> {
    if (this.cleanupInProgress) {
      return;
    }
    this.cleanupInProgress = true;

    try {
      await this.performCleanup();
    } finally {
      this.cleanupInProgress = false;
    }
  }

  // Private methods

  private async ensureCacheDirectory(): Promise<void> {
    const exists = await RNFS.exists(this.cacheDir);
    if (!exists) {
      await RNFS.mkdir(this.cacheDir);
    }
  }

  private generateCacheKey(url: string, options: ImageCacheOptions = {}): string {
    const optionsStr = JSON.stringify(options);
    return `${url}_${optionsStr}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private async downloadAndCache(url: string, options: ImageCacheOptions): Promise<string> {
    const cacheKey = this.generateCacheKey(url, options);
    const fileName = `${cacheKey}.${options.format || 'jpg'}`;
    const localPath = `${this.cacheDir}/${fileName}`;

    try {
      // Optimize image URL
      const optimizedUrl = await PerformanceOptimizationService.optimizeImageLoading(url);

      // Download image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: optimizedUrl,
        toFile: localPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Get file stats
        const fileStats = await RNFS.stat(localPath);

        // Create cache entry
        const entry: CacheEntry = {
          url,
          localPath,
          timestamp: Date.now(),
          size: fileStats.size,
          priority: options.priority || 1,
          accessCount: 1,
          lastAccess: Date.now(),
          format: options.format || 'jpg',
          quality: options.quality,
        };

        // Add to cache
        this.cache.set(cacheKey, entry);
        this.stats.totalSize += entry.size;
        this.stats.itemCount++;

        // Save cache index
        await this.saveCacheIndex();

        // Check if cleanup is needed
        if (this.shouldCleanup()) {
          setImmediate(() => this.cleanup());
        }

        return localPath;
      } else {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      errorInDev('Failed to download and cache image:', String(error));
      throw error;
    }
  }

  private async isCacheEntryValid(entry: CacheEntry): Promise<boolean> {
    // Check if file exists
    const exists = await RNFS.exists(entry.localPath);
    if (!exists) {
      return false;
    }

    // Check age
    const age = Date.now() - entry.timestamp;
    if (age > this.config.maxAge) {
      return false;
    }

    return true;
  }

  private async loadCacheIndex(): Promise<void> {
    try {
      await secureStorage.initialize();
      const indexData = await secureStorage.getItem('imageCacheIndex');
      if (indexData) {
        const entries: CacheEntry[] = JSON.parse(indexData);
        entries.forEach((entry) => {
          const cacheKey = this.generateCacheKey(entry.url);
          this.cache.set(cacheKey, entry);
        });

        // Recalculate stats
        this.recalculateStats();
      }
    } catch (error) {
      warnInDev('Failed to load cache index:', String(error));
    }
  }

  private async saveCacheIndex(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      await secureStorage.setItem('imageCacheIndex', JSON.stringify(entries));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      warnInDev('Failed to save cache index:', err);
    }
  }

  private async validateCacheEntries(): Promise<void> {
    const invalidEntries: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (!(await this.isCacheEntryValid(entry))) {
        invalidEntries.push(key);
      }
    }

    // Remove invalid entries
    for (const key of invalidEntries) {
      const entry = this.cache.get(key);
      if (entry) {
        try {
          await RNFS.unlink(entry.localPath);
        } catch (error) {
          // File might already be deleted
        }
        this.cache.delete(key);
      }
    }

    if (invalidEntries.length > 0) {
      this.recalculateStats();
      await this.saveCacheIndex();
    }
  }

  private shouldCleanup(): boolean {
    const sizeLimitExceeded = this.stats.totalSize > this.config.maxCacheSize * 1024 * 1024;
    const itemLimitExceeded = this.stats.itemCount > this.config.maxItems;
    const timeSinceLastCleanup = Date.now() - this.stats.lastCleanup;
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours

    return sizeLimitExceeded || itemLimitExceeded || timeSinceLastCleanup > cleanupInterval;
  }

  private async performCleanup(): Promise<void> {
    logInDev('Starting cache cleanup...');

    // Sort entries by priority and access patterns (LRU)
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => {
        // Lower priority and older access = higher cleanup priority
        const priorityDiff = a.entry.priority - b.entry.priority;
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        const accessDiff = a.entry.lastAccess - b.entry.lastAccess;
        return accessDiff;
      });

    const targetSize = this.config.maxCacheSize * 0.8 * 1024 * 1024; // 80% of max size
    const targetItems = Math.floor(this.config.maxItems * 0.8); // 80% of max items

    let currentSize = this.stats.totalSize;
    let currentItems = this.stats.itemCount;
    const toDelete: string[] = [];

    for (const { key, entry } of entries) {
      if (currentSize <= targetSize && currentItems <= targetItems) {
        break;
      }

      toDelete.push(key);
      currentSize -= entry.size;
      currentItems--;
    }

    // Delete selected entries
    for (const key of toDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        try {
          await RNFS.unlink(entry.localPath);
          this.cache.delete(key);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          warnInDev('Failed to delete cached file:', err);
        }
      }
    }

    this.recalculateStats();
    this.stats.lastCleanup = Date.now();
    await this.saveCacheIndex();

    logInDev(`Cache cleanup completed. Deleted ${toDelete.length} items.`);
  }

  private scheduleCleanup(): void {
    // Schedule cleanup every 6 hours
    setInterval(
      () => {
        if (this.shouldCleanup()) {
          this.cleanup();
        }
      },
      6 * 60 * 60 * 1000,
    );
  }

  private recalculateStats(): void {
    this.stats.totalSize = 0;
    this.stats.itemCount = this.cache.size;

    for (const entry of this.cache.values()) {
      this.stats.totalSize += entry.size;
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

export default ImageCacheManager.getInstance();
export type { CacheConfig, CacheEntry, CacheStats };
export { ImageCacheManager };
