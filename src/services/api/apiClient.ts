import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'https://api.dev.aynamoda.com/api/v1'
    : 'https://api.aynamoda.com/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'aynamoda_access_token',
  REFRESH_TOKEN: 'aynamoda_refresh_token',
};

// Request/Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StyleDNA {
  id: string;
  userId: string;
  preferences: {
    colors: string[];
    styles: string[];
    occasions: string[];
    brands: string[];
  };
  personality: {
    adventurous: number;
    classic: number;
    trendy: number;
    comfortable: number;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Token management
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEYS.ACCESS_TOKEN, accessToken],
        [TOKEN_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEYS.ACCESS_TOKEN, TOKEN_KEYS.REFRESH_TOKEN]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // HTTP request wrapper with retry logic
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'User-Agent': `AYNAMODA-Mobile/${Platform.OS}`,
        ...options.headers,
      };

      // Add authorization header if required
      if (requiresAuth) {
        const token = await this.getAccessToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          return {
            success: false,
            error: 'No access token available',
          };
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401 && requiresAuth) {
          const refreshed = await this.refreshToken();
          if (refreshed && retryCount < API_CONFIG.RETRY_ATTEMPTS) {
            return this.makeRequest(endpoint, options, requiresAuth, retryCount + 1);
          }
          await this.clearTokens();
          return {
            success: false,
            error: 'Authentication failed',
          };
        }

        return {
          success: false,
          error: responseData.error || responseData.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Retry on network errors
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && 
          (error.name === 'AbortError' || error.message?.includes('network'))) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
        return this.makeRequest(endpoint, options, requiresAuth, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        await this.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      await this.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      await this.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST',
    }, true);

    await this.clearTokens();
    return response;
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/users/profile', {
      method: 'GET',
    }, true);
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, true);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }, true);
  }

  // Style DNA methods
  async getStyleDNA(): Promise<ApiResponse<StyleDNA>> {
    return this.makeRequest<StyleDNA>('/users/style-dna', {
      method: 'GET',
    }, true);
  }

  async createStyleDNA(styleDNA: Omit<StyleDNA, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StyleDNA>> {
    return this.makeRequest<StyleDNA>('/users/style-dna', {
      method: 'POST',
      body: JSON.stringify(styleDNA),
    }, true);
  }

  async updateStyleDNA(styleDNA: Partial<StyleDNA>): Promise<ApiResponse<StyleDNA>> {
    return this.makeRequest<StyleDNA>('/users/style-dna', {
      method: 'PUT',
      body: JSON.stringify(styleDNA),
    }, true);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      return false;
    }

    // Verify token with a simple API call
    const response = await this.getUserProfile();
    return response.success;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;