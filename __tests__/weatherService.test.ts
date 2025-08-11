// Weather Service Tests
// Comprehensive test suite for weather integration service

import { WeatherService } from '@/services/weatherService';
import { WeatherContext, WeatherCondition } from '@/types/aynaMirror';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-location');

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York'
  };

  const mockWeatherAPIResponse = {
    main: {
      temp: 72,
      humidity: 65
    },
    weather: [
      {
        main: 'Clear',
        description: 'clear sky'
      }
    ],
    wind: {
      speed: 8
    },
    name: 'New York'
  };

  const mockForecastAPIResponse = {
    list: [
      {
        dt: Date.now() / 1000,
        main: { temp: 70, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5 }
      },
      {
        dt: (Date.now() / 1000) + 86400, // +1 day
        main: { temp: 75, humidity: 55 },
        weather: [{ main: 'Clouds', description: 'few clouds' }],
        wind: { speed: 7 }
      }
    ],
    city: { name: 'New York' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    
    // Mock Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: mockLocation
    });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      { city: 'New York', subregion: 'NY' }
    ]);

    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherAPIResponse)
    });

    // Set environment variable for tests
    process.env.EXPO_PUBLIC_WEATHER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  });

  describe('getCurrentWeatherContext', () => {
    it('should fetch and return current weather context', async () => {
      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toEqual({
        temperature: 72,
        condition: 'sunny',
        humidity: 65,
        windSpeed: 8,
        location: 'New York',
        timestamp: expect.any(Date)
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('weather'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should use cached weather data when available and fresh', async () => {
      const cachedWeatherData = {
        data: {
          temperature: 68,
          condition: 'cloudy' as WeatherCondition,
          humidity: 70,
          windSpeed: 10,
          location: 'New York',
          timestamp: new Date()
        },
        timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago (fresh)
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedWeatherData));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toEqual(cachedWeatherData.data);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when cache is expired', async () => {
      const expiredCacheData = {
        data: {
          temperature: 68,
          condition: 'cloudy' as WeatherCondition,
          humidity: 70,
          windSpeed: 10,
          location: 'New York',
          timestamp: new Date()
        },
        timestamp: Date.now() - 40 * 60 * 1000 // 40 minutes ago (expired)
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredCacheData));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result.temperature).toBe(72); // Fresh data from API
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return fallback weather when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toEqual({
        temperature: expect.any(Number),
        condition: expect.any(String),
        humidity: 50,
        windSpeed: 5,
        location: 'Unknown',
        timestamp: expect.any(Date)
      });
    });

    it('should handle location permission denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      // Mock cached location
      const cachedLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York'
      };
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'last_known_location') {
          return Promise.resolve(JSON.stringify(cachedLocation));
        }
        return Promise.resolve(null);
      });

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('should handle missing API key', async () => {
      delete process.env.EXPO_PUBLIC_WEATHER_API_KEY;

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toEqual({
        temperature: expect.any(Number),
        condition: expect.any(String),
        humidity: 50,
        windSpeed: 5,
        location: 'Unknown',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('getWeatherForecast', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockForecastAPIResponse)
      });
    });

    it('should fetch and return weather forecast', async () => {
      const result = await WeatherService.getWeatherForecast(2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        temperature: expect.any(Number),
        condition: expect.any(String),
        humidity: expect.any(Number),
        windSpeed: expect.any(Number),
        location: 'New York',
        timestamp: expect.any(Date)
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('forecast'),
        expect.any(Object)
      );
    });

    it('should use cached forecast when available', async () => {
      const cachedForecast = [
        {
          temperature: 70,
          condition: 'sunny' as WeatherCondition,
          humidity: 60,
          windSpeed: 5,
          location: 'New York',
          timestamp: new Date()
        }
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('forecast')) {
          return Promise.resolve(JSON.stringify(cachedForecast));
        }
        return Promise.resolve(null);
      });

      const result = await WeatherService.getWeatherForecast(1);

      expect(result).toEqual(cachedForecast);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return fallback forecast when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Forecast API Error'));

      const result = await WeatherService.getWeatherForecast(3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        temperature: expect.any(Number),
        condition: expect.any(String),
        humidity: 50,
        windSpeed: 5,
        location: 'Unknown',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('analyzeWeatherAppropriatenessForItem', () => {
    const mockWeather: WeatherContext = {
      temperature: 75,
      condition: 'sunny',
      humidity: 60,
      windSpeed: 8,
      location: 'Test City',
      timestamp: new Date()
    };

    it('should return high score for weather-appropriate items', async () => {
      const lightSummerTop = {
        category: 'tops',
        tags: ['light', 'breathable', 'summer']
      };

      const score = WeatherService.analyzeWeatherAppropriatenessForItem(lightSummerTop, mockWeather);

  expect(score).toBeGreaterThanOrEqual(0.7);
    });

    it('should return low score for weather-inappropriate items', async () => {
      const heavyWinterCoat = {
        category: 'outerwear',
        tags: ['heavy', 'winter', 'warm']
      };

      const score = WeatherService.analyzeWeatherAppropriatenessForItem(heavyWinterCoat, mockWeather);

  expect(score).toBeLessThanOrEqual(0.3);
    });

    it('should handle rainy weather appropriately', async () => {
      const rainyWeather: WeatherContext = {
        ...mockWeather,
        condition: 'rainy'
      };

      const waterproofJacket = {
        category: 'outerwear',
        tags: ['waterproof', 'rain-resistant']
      };

      const suedeBag = {
        category: 'accessories',
        tags: ['suede', 'delicate']
      };

      const waterproofScore = WeatherService.analyzeWeatherAppropriatenessForItem(waterproofJacket, rainyWeather);
      const suedeScore = WeatherService.analyzeWeatherAppropriatenessForItem(suedeBag, rainyWeather);

      expect(waterproofScore).toBeGreaterThan(suedeScore);
    });

    it('should handle cold weather appropriately', async () => {
      const coldWeather: WeatherContext = {
        ...mockWeather,
        temperature: 35
      };

      const warmCoat = {
        category: 'outerwear',
        tags: ['warm', 'winter']
      };

      const lightTank = {
        category: 'tops',
        tags: ['light', 'sleeveless', 'summer']
      };

      const coatScore = WeatherService.analyzeWeatherAppropriatenessForItem(warmCoat, coldWeather);
      const tankScore = WeatherService.analyzeWeatherAppropriatenessForItem(lightTank, coldWeather);

      expect(coatScore).toBeGreaterThan(tankScore);
    });

    it('should return neutral score on error', async () => {
      const invalidItem = null as any;

      const score = WeatherService.analyzeWeatherAppropriatenessForItem(invalidItem, mockWeather);

      expect(score).toBe(0.5);
    });
  });

  describe('filterRecommendationsByWeather', () => {
    const mockWeather: WeatherContext = {
      temperature: 40, // Cold weather
      condition: 'rainy',
      humidity: 80,
      windSpeed: 15,
      location: 'Test City',
      timestamp: new Date()
    };

    const mockRecommendations = [
      {
        id: '1',
        items: [
          { category: 'outerwear', tags: ['waterproof', 'warm'] },
          { category: 'bottoms', tags: ['warm', 'long'] }
        ]
      },
      {
        id: '2',
        items: [
          { category: 'tops', tags: ['light', 'sleeveless'] },
          { category: 'bottoms', tags: ['shorts', 'summer'] }
        ]
      },
      {
        id: '3',
        items: [
          { category: 'tops', tags: ['long-sleeve', 'warm'] },
          { category: 'shoes', tags: ['waterproof', 'boots'] }
        ]
      }
    ];

    it('should filter out weather-inappropriate recommendations', async () => {
      const filtered = WeatherService.filterRecommendationsByWeather(
        mockRecommendations,
        mockWeather,
        0.4 // Minimum score threshold
      );

      expect(filtered.length).toBeLessThan(mockRecommendations.length);
      expect(filtered.find(r => r.id === '2')).toBeUndefined(); // Summer outfit should be filtered out
    });

    it('should sort recommendations by weather appropriateness', async () => {
      const filtered = WeatherService.filterRecommendationsByWeather(
        mockRecommendations,
        mockWeather,
        0.1 // Low threshold to keep all items
      );

      // First recommendation should be most weather-appropriate (waterproof + warm)
      expect(filtered[0].id).toBe('1');
    });

    it('should return original recommendations on error', async () => {
      const invalidWeather = null as any;

      const result = WeatherService.filterRecommendationsByWeather(
        mockRecommendations,
        invalidWeather
      );

      expect(result).toEqual(mockRecommendations);
    });
  });

  describe('getWeatherBasedSuggestions', () => {
    it('should provide cold weather suggestions', async () => {
      const coldWeather: WeatherContext = {
        temperature: 25,
        condition: 'snowy',
        humidity: 70,
        windSpeed: 10,
        location: 'Test City',
        timestamp: new Date()
      };

      const suggestions = WeatherService.getWeatherBasedSuggestions(coldWeather);

  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/warm|layer|coat/i)]));
  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/waterproof|boots/i)]));
    });

    it('should provide hot weather suggestions', async () => {
      const hotWeather: WeatherContext = {
        temperature: 95,
        condition: 'sunny',
        humidity: 40,
        windSpeed: 5,
        location: 'Test City',
        timestamp: new Date()
      };

      const suggestions = WeatherService.getWeatherBasedSuggestions(hotWeather);

  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/light|breathable|cool/i)]));
  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/sun protection/i)]));
    });

    it('should provide rainy weather suggestions', async () => {
      const rainyWeather: WeatherContext = {
        temperature: 65,
        condition: 'rainy',
        humidity: 85,
        windSpeed: 12,
        location: 'Test City',
        timestamp: new Date()
      };

      const suggestions = WeatherService.getWeatherBasedSuggestions(rainyWeather);

  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/waterproof|water-resistant/i)]));
  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/quick-dry/i)]));
    });

    it('should provide windy weather suggestions', async () => {
      const windyWeather: WeatherContext = {
        temperature: 70,
        condition: 'windy',
        humidity: 50,
        windSpeed: 25,
        location: 'Test City',
        timestamp: new Date()
      };

      const suggestions = WeatherService.getWeatherBasedSuggestions(windyWeather);

  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/wind|secure|fitted/i)]));
    });

    it('should handle high humidity suggestions', async () => {
      const humidWeather: WeatherContext = {
        temperature: 80,
        condition: 'cloudy',
        humidity: 90,
        windSpeed: 3,
        location: 'Test City',
        timestamp: new Date()
      };

      const suggestions = WeatherService.getWeatherBasedSuggestions(humidWeather);

  expect(suggestions).toEqual(expect.arrayContaining([expect.stringMatching(/breathable|moisture-wicking/i)]));
    });

    it('should return default suggestion on error', async () => {
      const invalidWeather = null as any;

      const suggestions = WeatherService.getWeatherBasedSuggestions(invalidWeather);

      expect(suggestions).toContain('Check the weather and dress accordingly');
    });
  });

  describe('Error Handling and Reliability', () => {
    it('should handle network timeouts gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      expect(result.location).toBe('Unknown'); // Fallback weather
    });

    it('should handle API rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      expect(result.location).toBe('Unknown'); // Fallback weather
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      // Should still return a valid WeatherContext structure
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('humidity');
    });

    it('should handle AsyncStorage failures gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));

      // Should still work without caching
      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      expect(result.temperature).toBe(72); // From API
    });

    it('should handle location service failures', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Location Error'));
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Location Error'));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      // Should use default location (New York)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=40.7128'),
        expect.any(Object)
      );
    });
  });

  describe('Caching System', () => {
    it('should cache weather data after successful API call', async () => {
      await WeatherService.getCurrentWeatherContext('user123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('weather_cache_'),
        expect.stringContaining('"temperature":72')
      );
    });

    it('should cache location data after successful location fetch', async () => {
      await WeatherService.getCurrentWeatherContext('user123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_known_location',
        expect.stringContaining('"city":"New York"')
      );
    });

    it('should not break service when caching fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Cache Error'));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result).toBeDefined();
      expect(result.temperature).toBe(72); // Should still return API data
    });
  });

  describe('Seasonal Fallbacks', () => {
    it('should provide appropriate winter fallback', async () => {
      // Mock current date to be in winter
      const originalDate = Date;
      const mockDate = new Date('2024-01-15'); // January
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result.temperature).toBeLessThan(60); // Should be cold
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('should provide appropriate summer fallback', async () => {
      // Mock current date to be in summer
      const originalDate = Date;
      const mockDate = new Date('2024-07-15'); // July
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await WeatherService.getCurrentWeatherContext('user123');

      expect(result.temperature).toBeGreaterThan(70); // Should be warm
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});