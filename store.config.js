// store.config.js - App Store submission configuration

module.exports = {
  // App Store Connect Configuration
  appStoreConnect: {
    appId: 'com.aynamoda.app',
    teamId: process.env.APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID',
    bundleId: 'com.aynamoda.app',
    
    // App Store Metadata
    metadata: {
      name: 'AYNAMODA',
      subtitle: 'AI Fashion Companion',
      description: {
        short: 'AI-powered fashion companion for sustainable style choices',
        full: `AYNAMODA is your intelligent fashion companion that revolutionizes how you interact with your wardrobe. Using advanced AI technology, AYNAMODA helps you:

• Discover your unique personal style
• Organize and catalog your wardrobe efficiently
• Get personalized outfit recommendations
• Make sustainable fashion choices
• Reduce clothing waste through smart styling
• Track your fashion carbon footprint

Key Features:
- AI-powered style analysis and recommendations
- Smart wardrobe organization with photo recognition
- Sustainable fashion insights and tips
- Outfit planning and coordination tools
- Style confidence tracking
- Social sharing and community features

Join thousands of users who have transformed their relationship with fashion through AYNAMODA's intelligent approach to personal style.`
      },
      
      keywords: [
        'fashion', 'AI', 'wardrobe', 'style', 'sustainable fashion',
        'outfit planning', 'personal stylist', 'clothing organization',
        'fashion AI', 'style guide', 'wardrobe management', 'eco fashion'
      ],
      
      categories: {
        primary: 'Lifestyle',
        secondary: 'Shopping'
      },
      
      ageRating: '4+',
      
      supportUrl: 'https://aynamoda.app/support',
      marketingUrl: 'https://aynamoda.app',
      privacyPolicyUrl: 'https://aynamoda.app/privacy',
      termsOfServiceUrl: 'https://aynamoda.app/terms',
      
      // Contact Information
      contactEmail: 'support@aynamoda.app',
      contactPhone: '+90-555-0123',
      
      // App Store Specific
      appStoreCategory: 'Lifestyle',
      secondaryCategory: 'Shopping',
      contentRating: '4+',
      
      // Localization
      defaultLanguage: 'en',
      availableLanguages: ['en', 'tr', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']
    },
    
    // App Store Review Information
    reviewInformation: {
      firstName: 'AYNAMODA',
      lastName: 'Team',
      phoneNumber: '+90-555-0123',
      email: 'review@aynamoda.app',
      demoAccount: {
        username: 'demo@aynamoda.app',
        password: 'DemoPass123!'
      },
      notes: `Thank you for reviewing AYNAMODA!

This app uses AI to help users organize their wardrobe and make sustainable fashion choices. Key features to test:

1. Wardrobe Management: Users can add clothing items with photos
2. AI Recommendations: The app suggests outfits based on user preferences
3. Sustainability Features: Carbon footprint tracking and eco-friendly tips
4. Style Analysis: Personal style assessment and improvement suggestions

Demo Account: demo@aynamoda.app / DemoPass123!

The app requires camera and photo library permissions for wardrobe photo capture and organization features.`
    }
  },
  
  // Google Play Store Configuration
  googlePlay: {
    packageName: 'com.aynamoda.app',
    
    metadata: {
      title: 'AYNAMODA - AI Fashion Companion',
      shortDescription: 'AI-powered fashion companion for sustainable style choices and smart wardrobe management',
      fullDescription: `Transform your fashion experience with AYNAMODA, the intelligent fashion companion that helps you discover your unique style while making sustainable choices.

🤖 AI-POWERED STYLING
• Get personalized outfit recommendations
• Discover your unique style DNA
• Smart color and pattern coordination
• Seasonal style adaptations

👗 SMART WARDROBE MANAGEMENT
• Photo-based clothing catalog
• Automatic item categorization
• Outfit planning and coordination
• Wear frequency tracking

🌱 SUSTAINABLE FASHION
• Carbon footprint tracking
• Sustainable brand recommendations
• Clothing lifecycle insights
• Waste reduction tips

📊 STYLE ANALYTICS
• Style confidence tracking
• Wardrobe utilization reports
• Fashion spending insights
• Personal style evolution

✨ PREMIUM FEATURES
• Advanced AI styling algorithms
• Unlimited wardrobe items
• Priority customer support
• Exclusive style content

Join the fashion revolution and make every outfit count with AYNAMODA!`,
      
      tags: [
        'fashion', 'AI', 'wardrobe', 'style', 'sustainable',
        'outfit', 'clothing', 'personal stylist', 'fashion AI'
      ],
      
      category: 'LIFESTYLE',
      contentRating: 'Everyone',
      
      website: 'https://aynamoda.app',
      email: 'support@aynamoda.app',
      phone: '+90-555-0123',
      privacyPolicy: 'https://aynamoda.app/privacy',
      termsOfService: 'https://aynamoda.app/terms'
    }
  },
  
  // Screenshots and Assets Requirements
  assets: {
    ios: {
      screenshots: {
        required: [
          '6.7_inch_display', // iPhone 14 Pro Max
          '6.1_inch_display', // iPhone 14 Pro
          '5.5_inch_display', // iPhone 8 Plus
          '12.9_inch_display', // iPad Pro 12.9
          '11_inch_display'   // iPad Pro 11
        ],
        path: './assets/screenshots/ios/'
      },
      appPreview: {
        path: './assets/previews/ios/',
        formats: ['mp4', 'mov'],
        maxDuration: 30 // seconds
      }
    },
    
    android: {
      screenshots: {
        required: [
          'phone',
          'sevenInchTablet',
          'tenInchTablet'
        ],
        path: './assets/screenshots/android/'
      },
      featureGraphic: {
        path: './assets/feature-graphic.png',
        dimensions: '1024x500'
      }
    }
  },
  
  // Localization
  localization: {
    defaultLanguage: 'en-US',
    supportedLanguages: [
      'en-US', // English
      'tr-TR', // Turkish
      'es-ES', // Spanish
      'fr-FR', // French
      'de-DE', // German
      'it-IT', // Italian
      'pt-BR', // Portuguese (Brazil)
      'ja-JP', // Japanese
      'ko-KR', // Korean
      'zh-CN'  // Chinese (Simplified)
    ]
  },
  
  // Release Notes Template
  releaseNotes: {
    template: {
      'en-US': `🎉 What's New in AYNAMODA v{version}

✨ New Features:
• {new_features}

🔧 Improvements:
• {improvements}

🐛 Bug Fixes:
• {bug_fixes}

Thank you for using AYNAMODA! Keep styling sustainably! 💚`,
      
      'tr-TR': `🎉 AYNAMODA v{version} Yenilikleri

✨ Yeni Özellikler:
• {new_features}

🔧 İyileştirmeler:
• {improvements}

🐛 Hata Düzeltmeleri:
• {bug_fixes}

AYNAMODA'yı kullandığınız için teşekkürler! Sürdürülebilir stil yapmaya devam edin! 💚`
    }
  }
};