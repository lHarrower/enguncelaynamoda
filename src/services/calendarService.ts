/**
 * Calendar Service
 * Handles calendar integration for outfit recommendations based on events
 */

import { CalendarContext } from '@/types/aynaMirror';
import { analyticsService } from './analyticsService';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  formalityLevel: 'casual' | 'business-casual' | 'business' | 'formal' | 'black-tie';
  category: 'work' | 'social' | 'personal' | 'fitness' | 'travel' | 'special';
}

interface CalendarPermissions {
  granted: boolean;
  canRead: boolean;
  canWrite: boolean;
}

class CalendarService {
  private permissions: CalendarPermissions = {
    granted: false,
    canRead: false,
    canWrite: false
  };

  /**
   * Request calendar permissions
   */
  async requestPermissions(): Promise<CalendarPermissions> {
    try {
      // In a real app, this would request actual calendar permissions:
      // - iOS: EventKit framework
      // - Android: Calendar Provider
      // - React Native: expo-calendar or react-native-calendar-events
      
      // Mock implementation for now
      this.permissions = {
        granted: true,
        canRead: true,
        canWrite: false // Usually read-only for outfit recommendations
      };

      analyticsService.trackEvent('calendar_permissions_requested', {
        granted: this.permissions.granted,
        timestamp: new Date().toISOString()
      });

      console.log('Calendar permissions requested:', this.permissions);
      return this.permissions;
    } catch (error) {
      console.error('Failed to request calendar permissions:', error);
      return {
        granted: false,
        canRead: false,
        canWrite: false
      };
    }
  }

  /**
   * Get calendar context for a specific date
   */
  async getCalendarContext(userId: string, date: Date = new Date()): Promise<CalendarContext | undefined> {
    try {
      if (!this.permissions.granted || !this.permissions.canRead) {
        console.log('Calendar permissions not granted, skipping calendar context');
        return undefined;
      }

      const events = await this.getEventsForDate(date);
      
      if (events.length === 0) {
        return {
          events: [],
          primaryEvent: undefined,
          formalityLevel: 'casual',
        };
      }

      // Find the most important/formal event of the day
      const primaryEvent = this.selectPrimaryEvent(events);
      const formalityLevel = this.calculateOverallFormalityLevel(events);
  const eventTypes = [...new Set(events.map(e => e.category))];

      analyticsService.trackEvent('calendar_context_retrieved', {
        user_id: userId,
        date: date.toISOString(),
        event_count: events.length,
        formality_level: formalityLevel,
        event_types: eventTypes
      });

      return {
        events: events.map(e => ({
          title: e.title,
          startTime: e.start,
          endTime: e.end,
          location: e.location,
          type: e.category === 'special' ? 'special' : (e.category as any)
        })),
        primaryEvent: {
          title: primaryEvent.title,
          startTime: primaryEvent.start,
          endTime: primaryEvent.end,
          location: primaryEvent.location,
          type: (primaryEvent.category as any)
        },
        formalityLevel: (formalityLevel === 'business-casual' ? 'business' : formalityLevel) as any,
      };
    } catch (error) {
      console.error('Failed to get calendar context:', error);
      return undefined;
    }
  }

  /**
   * Get events for a specific date
   */
  private async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    try {
      // In a real app, this would fetch from device calendar:
      // - iOS: EventKit
      // - Android: CalendarContract
      // - React Native: expo-calendar
      
      // Mock implementation with sample events
      const mockEvents: CalendarEvent[] = this.generateMockEvents(date);
      
      console.log(`Found ${mockEvents.length} events for ${date.toDateString()}`);
      return mockEvents;
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  /**
   * Generate mock events for demonstration
   */
  private generateMockEvents(date: Date): CalendarEvent[] {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Generate different events based on day and time
    const events: CalendarEvent[] = [];
    
    // Weekday work events
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (hour >= 9 && hour <= 17) {
        events.push({
          id: 'work-1',
          title: 'Team Meeting',
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
          formalityLevel: 'business-casual',
          category: 'work'
        });
      }
    }
    
    // Weekend social events
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (hour >= 18) {
        events.push({
          id: 'social-1',
          title: 'Dinner with Friends',
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22, 0),
          formalityLevel: 'casual',
          category: 'social'
        });
      }
    }
    
    return events;
  }

  /**
   * Select the most important event of the day
   */
  private selectPrimaryEvent(events: CalendarEvent[]): CalendarEvent {
    // Priority order: formal events first, then by start time
    const formalityPriority = {
      'black-tie': 5,
      'formal': 4,
      'business': 3,
      'business-casual': 2,
      'casual': 1
    };

    return events.sort((a, b) => {
      const formalityDiff = formalityPriority[b.formalityLevel] - formalityPriority[a.formalityLevel];
      if (formalityDiff !== 0) return formalityDiff;
      
      // If same formality, sort by start time
      return a.start.getTime() - b.start.getTime();
    })[0];
  }

  /**
   * Calculate overall formality level for the day
   */
  private calculateOverallFormalityLevel(events: CalendarEvent[]): 'casual' | 'business-casual' | 'business' | 'formal' | 'black-tie' {
    if (events.length === 0) return 'casual';
    
    const formalityScores = {
      'casual': 1,
      'business-casual': 2,
      'business': 3,
      'formal': 4,
      'black-tie': 5
    };
    
    const maxFormality = Math.max(...events.map(e => formalityScores[e.formalityLevel]));
    
    const formalityMap = {
      1: 'casual' as const,
      2: 'business-casual' as const,
      3: 'business' as const,
      4: 'formal' as const,
      5: 'black-tie' as const
    };
    
    return formalityMap[maxFormality as keyof typeof formalityMap];
  }

  /**
   * Determine time of day category
   */
  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Check if calendar permissions are granted
   */
  hasPermissions(): boolean {
    return this.permissions.granted && this.permissions.canRead;
  }

  /**
   * Get current permissions status
   */
  getPermissions(): CalendarPermissions {
    return { ...this.permissions };
  }

  /**
   * Analyze calendar patterns for better recommendations
   */
  async analyzeCalendarPatterns(userId: string, days: number = 30): Promise<{
    workDays: number[];
    commonEventTypes: string[];
    averageFormalityLevel: string;
    busyHours: number[];
  }> {
    try {
      // In a real app, this would analyze historical calendar data
      // to understand user patterns and improve recommendations
      
      const mockAnalysis = {
        workDays: [1, 2, 3, 4, 5], // Monday to Friday
        commonEventTypes: ['work', 'social', 'personal'],
        averageFormalityLevel: 'business-casual',
        busyHours: [9, 10, 11, 14, 15, 16] // Common meeting hours
      };
      
      analyticsService.trackEvent('calendar_patterns_analyzed', {
        user_id: userId,
        analysis_days: days,
        work_days_count: mockAnalysis.workDays.length,
        common_event_types: mockAnalysis.commonEventTypes
      });
      
      return mockAnalysis;
    } catch (error) {
      console.error('Failed to analyze calendar patterns:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
export default calendarService;