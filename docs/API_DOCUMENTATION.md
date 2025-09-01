# API Documentation

## Overview

This document provides comprehensive documentation for AYNAMODA's API services, including authentication, wardrobe management, AI features, and external integrations.

## Table of Contents

- [Authentication Service](#authentication-service)
- [Wardrobe Service](#wardrobe-service)
- [AI Service](#ai-service)
- [User Profile Service](#user-profile-service)
- [File Upload Service](#file-upload-service)
- [Analytics Service](#analytics-service)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Response Format](#api-response-format)

## Base Configuration

### Supabase Client

```javascript
// Base configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Headers

```javascript
// Standard headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${session?.access_token}`,
  'apikey': supabaseAnonKey,
};
```

## Authentication Service

### Sign Up

**Method**: `POST`  
**Endpoint**: `/auth/signup`  
**Description**: Register a new user account

```javascript
// Request
const signUp = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.fullName,
        avatar_url: userData.avatarUrl,
      },
    },
  });
  
  if (error) throw error;
  return data;
};
```

**Parameters**:
- `email` (string, required): User's email address
- `password` (string, required): User's password (min 8 characters)
- `userData` (object, optional): Additional user data
  - `fullName` (string): User's full name
  - `avatarUrl` (string): Profile picture URL

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-01T00:00:00Z",
    "user_metadata": {
      "full_name": "John Doe"
    }
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1640995200
  }
}
```

### Sign In

**Method**: `POST`  
**Endpoint**: `/auth/signin`  
**Description**: Authenticate existing user

```javascript
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};
```

### Sign Out

**Method**: `POST`  
**Endpoint**: `/auth/signout`  
**Description**: End user session

```javascript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### Reset Password

**Method**: `POST`  
**Endpoint**: `/auth/reset-password`  
**Description**: Send password reset email

```javascript
const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'aynamoda://reset-password',
  });
  
  if (error) throw error;
};
```

### Social Authentication

**Method**: `POST`  
**Endpoint**: `/auth/oauth`  
**Description**: Authenticate with social providers

```javascript
const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider, // 'google', 'apple', 'facebook'
    options: {
      redirectTo: 'aynamoda://auth-callback',
    },
  });
  
  if (error) throw error;
  return data;
};
```

## Wardrobe Service

### Add Clothing Item

**Method**: `POST`  
**Endpoint**: `/wardrobe/items`  
**Description**: Add a new clothing item to user's wardrobe

```javascript
const addClothingItem = async (itemData) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert({
      user_id: userId,
      name: itemData.name,
      category: itemData.category,
      subcategory: itemData.subcategory,
      brand: itemData.brand,
      color: itemData.color,
      size: itemData.size,
      purchase_date: itemData.purchaseDate,
      purchase_price: itemData.purchasePrice,
      image_url: itemData.imageUrl,
      tags: itemData.tags,
      notes: itemData.notes,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

**Parameters**:
- `name` (string, required): Item name
- `category` (enum, required): Item category (tops, bottoms, shoes, accessories)
- `subcategory` (string, optional): Specific subcategory
- `brand` (string, optional): Brand name
- `color` (string, optional): Primary color
- `size` (enum, optional): Size (XS, S, M, L, XL, XXL)
- `purchaseDate` (date, optional): Purchase date
- `purchasePrice` (number, optional): Purchase price
- `imageUrl` (string, optional): Item image URL
- `tags` (array, optional): Custom tags
- `notes` (string, optional): Additional notes

**Response**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Blue Denim Jacket",
  "category": "tops",
  "subcategory": "jacket",
  "brand": "Levi's",
  "color": "blue",
  "size": "M",
  "purchase_date": "2024-01-01",
  "purchase_price": 89.99,
  "image_url": "https://storage.url/image.jpg",
  "tags": ["casual", "denim"],
  "notes": "Perfect for spring weather",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Wardrobe Items

**Method**: `GET`  
**Endpoint**: `/wardrobe/items`  
**Description**: Retrieve user's wardrobe items with filtering

```javascript
const getWardrobeItems = async (filters = {}) => {
  let query = supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.color) {
    query = query.eq('color', filters.color);
  }
  
  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};
```

**Query Parameters**:
- `category` (string, optional): Filter by category
- `color` (string, optional): Filter by color
- `brand` (string, optional): Filter by brand
- `search` (string, optional): Search in name and brand
- `limit` (number, optional): Limit results (default: 50)
- `offset` (number, optional): Pagination offset

### Update Clothing Item

**Method**: `PUT`  
**Endpoint**: `/wardrobe/items/:id`  
**Description**: Update existing clothing item

```javascript
const updateClothingItem = async (itemId, updates) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### Delete Clothing Item

**Method**: `DELETE`  
**Endpoint**: `/wardrobe/items/:id`  
**Description**: Remove clothing item from wardrobe

```javascript
const deleteClothingItem = async (itemId) => {
  const { error } = await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);
    
  if (error) throw error;
};
```

### Mark Item as Worn

**Method**: `POST`  
**Endpoint**: `/wardrobe/items/:id/worn`  
**Description**: Record when an item was worn

```javascript
const markItemAsWorn = async (itemId, wornDate = new Date()) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update({
      last_worn: wornDate.toISOString(),
      wear_count: supabase.raw('wear_count + 1'),
    })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### Get Wardrobe Statistics

**Method**: `GET`  
**Endpoint**: `/wardrobe/stats`  
**Description**: Get wardrobe analytics and statistics

```javascript
const getWardrobeStats = async () => {
  const { data, error } = await supabase
    .rpc('get_wardrobe_stats', { user_id: userId });
    
  if (error) throw error;
  return data;
};
```

**Response**:
```json
{
  "total_items": 45,
  "items_by_category": {
    "tops": 15,
    "bottoms": 12,
    "shoes": 8,
    "accessories": 10
  },
  "most_worn_items": [
    {
      "id": "uuid",
      "name": "Black T-Shirt",
      "wear_count": 25
    }
  ],
  "least_worn_items": [
    {
      "id": "uuid",
      "name": "Formal Dress",
      "wear_count": 1
    }
  ],
  "total_value": 1250.50,
  "cost_per_wear": {
    "average": 12.50,
    "best": 2.30,
    "worst": 89.99
  }
}
```

## AI Service

### Analyze Style

**Method**: `POST`  
**Endpoint**: `/ai/analyze-style`  
**Description**: Analyze user's style based on wardrobe items

```javascript
const analyzeStyle = async (itemIds) => {
  const response = await fetch(`${AI_SERVICE_URL}/analyze-style`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
    },
    body: JSON.stringify({
      user_id: userId,
      item_ids: itemIds,
    }),
  });
  
  if (!response.ok) throw new Error('Style analysis failed');
  return response.json();
};
```

**Parameters**:
- `itemIds` (array, required): Array of wardrobe item IDs to analyze

**Response**:
```json
{
  "style_profile": {
    "primary_style": "casual",
    "secondary_styles": ["minimalist", "classic"],
    "confidence_score": 0.85
  },
  "color_palette": {
    "dominant_colors": ["black", "white", "navy"],
    "accent_colors": ["red", "gold"]
  },
  "recommendations": [
    {
      "type": "missing_category",
      "category": "formal_shoes",
      "reason": "Limited formal footwear options"
    }
  ]
}
```

### Generate Outfit Suggestions

**Method**: `POST`  
**Endpoint**: `/ai/suggest-outfits`  
**Description**: Generate outfit combinations based on occasion and weather

```javascript
const suggestOutfits = async (occasion, weather, preferences = {}) => {
  const response = await fetch(`${AI_SERVICE_URL}/suggest-outfits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
    },
    body: JSON.stringify({
      user_id: userId,
      occasion,
      weather,
      preferences,
    }),
  });
  
  if (!response.ok) throw new Error('Outfit suggestion failed');
  return response.json();
};
```

**Parameters**:
- `occasion` (string, required): Event type (casual, work, formal, date, etc.)
- `weather` (object, required): Weather conditions
  - `temperature` (number): Temperature in Celsius
  - `condition` (string): Weather condition (sunny, rainy, cloudy, etc.)
- `preferences` (object, optional): User preferences
  - `colors` (array): Preferred colors
  - `styles` (array): Preferred styles
  - `avoid_items` (array): Items to exclude

**Response**:
```json
{
  "outfits": [
    {
      "id": "outfit_1",
      "items": [
        {
          "id": "item_uuid",
          "name": "White Button Shirt",
          "category": "tops",
          "image_url": "https://storage.url/shirt.jpg"
        },
        {
          "id": "item_uuid",
          "name": "Navy Chinos",
          "category": "bottoms",
          "image_url": "https://storage.url/chinos.jpg"
        }
      ],
      "confidence_score": 0.92,
      "style_tags": ["smart-casual", "professional"],
      "weather_appropriate": true
    }
  ],
  "total_suggestions": 5
}
```

### Identify Clothing Item

**Method**: `POST`  
**Endpoint**: `/ai/identify-item`  
**Description**: Identify clothing item from image using AI

```javascript
const identifyClothingItem = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'clothing_item.jpg',
  });
  
  const response = await fetch(`${AI_SERVICE_URL}/identify-item`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
    },
    body: formData,
  });
  
  if (!response.ok) throw new Error('Item identification failed');
  return response.json();
};
```

**Parameters**:
- `image` (file, required): Image file of the clothing item

**Response**:
```json
{
  "predictions": [
    {
      "category": "tops",
      "subcategory": "t-shirt",
      "confidence": 0.95,
      "attributes": {
        "color": "blue",
        "pattern": "solid",
        "sleeve_length": "short",
        "neckline": "crew"
      }
    }
  ],
  "suggested_name": "Blue Crew Neck T-Shirt",
  "tags": ["casual", "basic", "everyday"]
}
```

## User Profile Service

### Get User Profile

**Method**: `GET`  
**Endpoint**: `/profile`  
**Description**: Retrieve user profile information

```javascript
const getUserProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Update User Profile

**Method**: `PUT`  
**Endpoint**: `/profile`  
**Description**: Update user profile information

```javascript
const updateUserProfile = async (updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### Update User Preferences

**Method**: `PUT`  
**Endpoint**: `/profile/preferences`  
**Description**: Update user preferences and settings

```javascript
const updateUserPreferences = async (preferences) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      preferences: {
        ...currentPreferences,
        ...preferences,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

## File Upload Service

### Upload Image

**Method**: `POST`  
**Endpoint**: `/storage/upload`  
**Description**: Upload image to storage bucket

```javascript
const uploadImage = async (imageUri, bucket = 'wardrobe-images') => {
  const fileName = `${userId}/${Date.now()}.jpg`;
  
  // Convert image to blob
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
};
```

### Delete Image

**Method**: `DELETE`  
**Endpoint**: `/storage/delete`  
**Description**: Delete image from storage

```javascript
const deleteImage = async (imagePath, bucket = 'wardrobe-images') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([imagePath]);
    
  if (error) throw error;
};
```

## Analytics Service

### Track Event

**Method**: `POST`  
**Endpoint**: `/analytics/track`  
**Description**: Track user events for analytics

```javascript
const trackEvent = async (eventName, properties = {}) => {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    });
    
  if (error) throw error;
};
```

### Get User Analytics

**Method**: `GET`  
**Endpoint**: `/analytics/user`  
**Description**: Get user-specific analytics data

```javascript
const getUserAnalytics = async (timeRange = '30d') => {
  const { data, error } = await supabase
    .rpc('get_user_analytics', {
      user_id: userId,
      time_range: timeRange,
    });
    
  if (error) throw error;
  return data;
};
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: User not authenticated
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `NETWORK_ERROR`: Connection failed

### Error Handling Pattern

```javascript
const handleApiError = (error) => {
  if (error.code === 'PGRST301') {
    throw new Error('Item not found');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Authentication required');
  }
  
  if (error.message?.includes('duplicate key')) {
    throw new Error('Item already exists');
  }
  
  throw new Error(error.message || 'An unexpected error occurred');
};
```

## Rate Limiting

### Limits

- **Authentication**: 10 requests per minute
- **Wardrobe Operations**: 100 requests per minute
- **AI Services**: 20 requests per minute
- **File Uploads**: 50 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

```javascript
const makeApiRequest = async (requestFn, retries = 3) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeApiRequest(requestFn, retries - 1);
    }
    throw error;
  }
};
```

## API Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Paginated Response

```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

---

## SDK Usage Examples

### Complete Wardrobe Management Flow

```javascript
import { authService, wardrobeService, aiService } from '../services';

// 1. Authenticate user
const user = await authService.signIn(email, password);

// 2. Upload item image
const imageUrl = await wardrobeService.uploadItemImage(imageUri);

// 3. Identify item using AI
const itemInfo = await aiService.identifyClothingItem(imageUri);

// 4. Add item to wardrobe
const newItem = await wardrobeService.addItem({
  name: itemInfo.suggested_name,
  category: itemInfo.predictions[0].category,
  imageUrl,
  ...otherData,
});

// 5. Get outfit suggestions
const outfits = await aiService.suggestOutfits('work', {
  temperature: 20,
  condition: 'sunny',
});

// 6. Track user interaction
analyticsService.trackEvent('outfit_viewed', {
  outfit_id: outfits[0].id,
  occasion: 'work',
});
```

### Error Handling Example

```javascript
try {
  const items = await wardrobeService.getItems({ category: 'tops' });
  return items;
} catch (error) {
  if (error.code === 'AUTHENTICATION_REQUIRED') {
    // Redirect to login
    navigation.navigate('Login');
  } else if (error.code === 'NETWORK_ERROR') {
    // Show offline message
    showOfflineMessage();
  } else {
    // Show generic error
    showErrorMessage(error.message);
  }
}
```

This API documentation provides a comprehensive guide for integrating with AYNAMODA's services. For additional support or questions, please refer to the developer guide or contact the development team.