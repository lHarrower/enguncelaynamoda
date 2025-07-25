export interface WeeklyColorTheme {
  id: string;
  name: string;
  color: string;
  description: string;
  mood: string;
  week: string;
}

export const weeklyColorThemes: WeeklyColorTheme[] = [
  {
    id: '1',
    name: 'Lavender Dreams',
    color: '#B794FF',
    description: 'Embrace ethereal beauty with soft lavender tones',
    mood: 'Dreamy & Confident',
    week: 'This Week',
  },
  {
    id: '2',
    name: 'Golden Hour',
    color: '#FCD34D',
    description: 'Capture the magic of warm, luminous gold',
    mood: 'Radiant & Warm',
    week: 'Next Week',
  },
  {
    id: '3',
    name: 'Ocean Mist',
    color: '#7DD3FC',
    description: 'Find serenity in calming blue-grey tones',
    mood: 'Peaceful & Fresh',
    week: 'Coming Soon',
  },
  {
    id: '4',
    name: 'Rose Quartz',
    color: '#F9A8D4',
    description: 'Soft pink hues for gentle sophistication',
    mood: 'Romantic & Gentle',
    week: 'Preview',
  },
];