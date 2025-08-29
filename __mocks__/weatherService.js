// Mock for weatherService to prevent dynamic import issues

export const weatherService = {
  getCurrentWeather: jest.fn().mockResolvedValue({
    temperature: 22,
    condition: 'sunny',
    humidity: 60,
    windSpeed: 10,
    location: 'Test City',
  }),

  getWeatherForecast: jest.fn().mockResolvedValue([
    {
      date: new Date().toISOString(),
      temperature: 22,
      condition: 'sunny',
      humidity: 60,
      windSpeed: 10,
    },
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      temperature: 20,
      condition: 'cloudy',
      humidity: 70,
      windSpeed: 15,
    },
  ]),

  isWeatherSuitableForOutfit: jest.fn().mockReturnValue(true),
};

export const WeatherService = weatherService;

export default weatherService;
