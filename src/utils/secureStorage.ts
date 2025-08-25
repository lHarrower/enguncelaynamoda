// Secure Storage Utility - Migration from AsyncStorage to SecureStore for sensitive data
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logInDev } from './consoleSuppress';

// Mock SecureStore for React Native without Expo
const SecureStore = {
  setItemAsync: async (key: string, value: string) => {
    return AsyncStorage.setItem(`secure_${key}`, value);
  },
  getItemAsync: async (key: string) => {
    return AsyncStorage.getItem(`secure_${key}`);
  },
  deleteItemAsync: async (key: string) => {
    return AsyncStorage.removeItem(`secure_${key}`);
  },
};

/**
 * Secure storage utility that uses SecureStore for sensitive data
 * and AsyncStorage for non-sensitive data
 */
export class SecureStorageManager {
  // Keys that should be stored securely
  private static readonly SECURE_KEYS = [
    'ayna_auth_user',
    'auth_token',
    'refresh_token',
    'user_credentials',
    'api_keys',
    'session_data',
  ];

  // Track last error encountered during getItem to allow callers to detect failures
  private static lastError: Error | null = null;

  /**
   * Allows callers to retrieve and clear the last getItem error if any
   */
  static getLastError(): Error | null {
    const err = this.lastError;
    this.lastError = null;
    return err;
  }

  /**
   * Determines if a key should be stored securely
   */
  private static shouldUseSecureStore(key: string): boolean {
    return this.SECURE_KEYS.some((secureKey) => key.includes(secureKey));
  }

  /**
   * Store data securely based on key sensitivity
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.shouldUseSecureStore(key)) {
        await SecureStore.setItemAsync(key, value);
        logInDev(`Stored ${key} in SecureStore`);
      } else {
        await AsyncStorage.setItem(key, value);
        logInDev(`Stored ${key} in AsyncStorage`);
      }
    } catch (error) {
      logInDev(`Failed to store ${key}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Retrieve data from appropriate storage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      if (this.shouldUseSecureStore(key)) {
        const value = await SecureStore.getItemAsync(key);
        logInDev(`Retrieved ${key} from SecureStore`);
        return value;
      } else {
        const value = await AsyncStorage.getItem(key);
        logInDev(`Retrieved ${key} from AsyncStorage`);
        return value;
      }
    } catch (error) {
      // Record last error so higher-level services can distinguish between
      // missing value and retrieval failure, while preserving current API (null on error)
      this.lastError = error instanceof Error ? error : new Error(String(error));
      logInDev(
        `Failed to retrieve ${key}:`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  /**
   * Remove data from appropriate storage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      if (this.shouldUseSecureStore(key)) {
        await SecureStore.deleteItemAsync(key);
        logInDev(`Removed ${key} from SecureStore`);
      } else {
        await AsyncStorage.removeItem(key);
        logInDev(`Removed ${key} from AsyncStorage`);
      }
    } catch (error) {
      logInDev(`Failed to remove ${key}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Migrate existing AsyncStorage data to SecureStore for sensitive keys
   */
  static async migrateToSecureStore(): Promise<void> {
    try {
      logInDev('Starting migration to SecureStore...');

      for (const secureKey of this.SECURE_KEYS) {
        // Check if data exists in AsyncStorage
        const value = await AsyncStorage.getItem(secureKey);
        if (value) {
          // Move to SecureStore
          await SecureStore.setItemAsync(secureKey, value);
          // Remove from AsyncStorage
          await AsyncStorage.removeItem(secureKey);
          logInDev(`Migrated ${secureKey} to SecureStore`);
        }
      }

      // Mark migration as complete
      await AsyncStorage.setItem('secure_migration_complete', 'true');
      logInDev('SecureStore migration completed');
    } catch (error) {
      logInDev(
        'SecureStore migration failed:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * Check if migration has been completed
   */
  static async isMigrationComplete(): Promise<boolean> {
    try {
      const migrationComplete = await AsyncStorage.getItem('secure_migration_complete');
      return migrationComplete === 'true';
    } catch (error) {
      logInDev(
        'Failed to check migration status:',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  /**
   * Initialize secure storage and perform migration if needed
   */
  static async initialize(): Promise<void> {
    try {
      const migrationComplete = await this.isMigrationComplete();
      if (!migrationComplete) {
        await this.migrateToSecureStore();
      }
      logInDev('SecureStorage initialized');
    } catch (error) {
      logInDev(
        'SecureStorage initialization failed:',
        error instanceof Error ? error.message : String(error),
      );
      // Don't throw - allow app to continue with AsyncStorage
    }
  }

  /**
   * Get all keys from storage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      logInDev('Failed to get all keys:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Clear all secure data
   */
  static async clearSecureData(): Promise<void> {
    try {
      for (const secureKey of this.SECURE_KEYS) {
        await SecureStore.deleteItemAsync(secureKey).catch(() => {});
      }
      logInDev('Cleared all secure data');
    } catch (error) {
      logInDev(
        'Failed to clear secure data:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

// Export convenience methods
export const secureStorage = {
  setItem: SecureStorageManager.setItem.bind(SecureStorageManager),
  getItem: SecureStorageManager.getItem.bind(SecureStorageManager),
  removeItem: SecureStorageManager.removeItem.bind(SecureStorageManager),
  getAllKeys: SecureStorageManager.getAllKeys.bind(SecureStorageManager),
  initialize: SecureStorageManager.initialize.bind(SecureStorageManager),
  clearSecureData: SecureStorageManager.clearSecureData.bind(SecureStorageManager),
  getLastError: SecureStorageManager.getLastError.bind(SecureStorageManager),
};
