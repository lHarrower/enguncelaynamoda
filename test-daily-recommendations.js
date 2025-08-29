// Simple test script to simulate daily recommendations

// Mock data similar to the test file
const mockWardrobeItems = [
  {
    id: 'item-1',
    category: 'tops',
    name: 'Blue Cotton Shirt',
    colors: ['blue', 'white'],
    tags: ['casual', 'work'],
    usageStats: {
      totalWears: 5,
      lastWorn: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      averageRating: 4.2,
      complimentsReceived: 2,
      costPerWear: 12.5,
    },
  },
  {
    id: 'item-2',
    category: 'bottoms',
    name: 'Black Dress Pants',
    colors: ['black'],
    tags: ['professional', 'versatile'],
    usageStats: {
      totalWears: 8,
      lastWorn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      averageRating: 4.5,
      complimentsReceived: 3,
      costPerWear: 8.75,
    },
  },
  {
    id: 'item-3',
    category: 'shoes',
    name: 'Brown Leather Shoes',
    colors: ['brown'],
    tags: ['casual', 'comfortable'],
    usageStats: {
      totalWears: 12,
      lastWorn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      averageRating: 4.8,
      complimentsReceived: 1,
      costPerWear: 6.25,
    },
  },
  {
    id: 'item-4',
    category: 'tops',
    name: 'White T-Shirt',
    colors: ['white'],
    tags: ['casual', 'basic'],
    usageStats: {
      totalWears: 15,
      lastWorn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      averageRating: 4.0,
      complimentsReceived: 0,
      costPerWear: 3.33,
    },
  },
  {
    id: 'item-5',
    category: 'bottoms',
    name: 'Dark Jeans',
    colors: ['blue', 'dark'],
    tags: ['casual', 'weekend'],
    usageStats: {
      totalWears: 20,
      lastWorn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      averageRating: 4.6,
      complimentsReceived: 4,
      costPerWear: 4.5,
    },
  },
];

// Mock weather context
const mockWeatherContext = {
  temperature: 22, // Celsius
  condition: 'sunny',
  humidity: 65,
  location: 'Istanbul',
  timestamp: new Date(),
};

// Simple outfit generation algorithm
function generateSimpleOutfitRecommendations(wardrobe, weatherContext) {
  
  

  const recommendations = [];

  // Get different categories
  const tops = wardrobe.filter((item) => item.category === 'tops');
  const bottoms = wardrobe.filter((item) => item.category === 'bottoms');
  const shoes = wardrobe.filter((item) => item.category === 'shoes');

  
  
  
  
  

  
  
  
  

  // Generate 3 different outfit combinations
  for (let i = 0; i < 3; i++) {
    const outfit = [];
    let confidenceScore = 0;
    let reasoning = [];

    // Select items for this outfit
    if (tops.length > 0) {
      const top = tops[i % tops.length];
      outfit.push(top);
      confidenceScore += top.usageStats.averageRating / 5;
      reasoning.push(`${top.name} has ${top.usageStats.averageRating}/5 rating`);
    }

    if (bottoms.length > 0) {
      const bottom = bottoms[i % bottoms.length];
      outfit.push(bottom);
      confidenceScore += bottom.usageStats.averageRating / 5;
      reasoning.push(`${bottom.name} pairs well`);
    }

    if (shoes.length > 0) {
      const shoe = shoes[i % shoes.length];
      outfit.push(shoe);
      confidenceScore += shoe.usageStats.averageRating / 5;
      reasoning.push(`${shoe.name} completes the look`);
    }

    // Weather-based adjustments
    if (weatherContext.temperature < 15) {
      reasoning.push('Warm layers recommended for cold weather');
      confidenceScore += 0.1;
    } else if (weatherContext.temperature > 25) {
      reasoning.push('Light, breathable fabrics for warm weather');
      confidenceScore += 0.1;
    }

    // Generate confidence note
    const confidenceNotes = [
      `✨ This combination brings out your best! The ${outfit.map((item) => item.colors.join('/')).join(' and ')} colors create a harmonious look that's perfect for today's ${weatherContext.condition} weather.`,
      `🌟 You'll feel confident and stylish in this outfit! The mix of ${outfit.map((item) => item.tags[0]).join(', ')} pieces gives you the perfect balance for any occasion.`,
      `💫 This ensemble showcases your personal style beautifully! With an average rating of ${(confidenceScore / outfit.length).toFixed(1)}/5 from your past wears, you know this combination works.`,
    ];

    const recommendation = {
      id: `rec-${i + 1}`,
      items: outfit,
      confidenceScore: Math.min(1, confidenceScore / outfit.length),
      confidenceNote: confidenceNotes[i],
      reasoning: reasoning,
      isQuickOption: i === 0,
      quickActions: [
        { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
        { type: 'save', label: 'Save for Later', icon: 'bookmark' },
        { type: 'share', label: 'Share', icon: 'share' },
      ],
      createdAt: new Date(),
    };

    recommendations.push(recommendation);
  }

  return {
    id: 'daily-rec-' + Date.now(),
    userId: 'test-user-123',
    date: new Date(),
    recommendations: recommendations,
    weatherContext: weatherContext,
    generatedAt: new Date(),
  };
}

// Test the recommendation system
function testDailyRecommendations() {
  try {
    const startTime = Date.now();
    const dailyRecs = generateSimpleOutfitRecommendations(mockWardrobeItems, mockWeatherContext);
    const endTime = Date.now();

    
    
    

    dailyRecs.recommendations.forEach((rec, index) => {
      
      
      

      rec.items.forEach((item, itemIndex) => {
        
        
        
        
        
      });

      
      

      
      rec.reasoning.forEach((reason, reasonIndex) => {
        
      });

      
      rec.quickActions.forEach((action) => {
        
      });
    });

    
    
    
    
    console.log(
      `- Ortalama güven skoru: ${((dailyRecs.recommendations.reduce((sum, rec) => sum + rec.confidenceScore, 0) / dailyRecs.recommendations.length) * 100).toFixed(1)}%`,
    );
    
    
    

    
    
    
    
    
    
  } catch (error) {
    
  }
}

// Run the test
testDailyRecommendations();
