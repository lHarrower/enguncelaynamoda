// Mock for expo-location
const Location = {
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }),
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([
      {
        city: 'New York',
        country: 'United States',
        district: null,
        isoCountryCode: 'US',
        name: '1 Hacker Way',
        postalCode: '10001',
        region: 'NY',
        street: 'Broadway',
        streetNumber: '1',
        subregion: 'New York County',
        timezone: 'America/New_York',
      },
    ]),
  ),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
};

module.exports = Location;
