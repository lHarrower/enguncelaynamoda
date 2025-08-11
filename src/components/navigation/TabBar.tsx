// Tab Bar Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface TabItem {
  key: string;
  title: string;
  icon?: string;
  badge?: number;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: any;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleTabPress = (tabKey: string) => {
    if (tabKey !== activeTab) {
      triggerSelection();
      onTabPress(tabKey);
    }
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {tab.icon && (
                  <View style={styles.iconContainer}>
                    <Text style={[styles.icon, isActive && styles.activeIcon]}>
                      {tab.icon}
                    </Text>
                    {tab.badge && tab.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {tab.badge > 99 ? '99+' : tab.badge.toString()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>
                  {tab.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EBF4FF',
  },
  tabContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
    color: '#6B7280',
  },
  activeIcon: {
    color: '#3B82F6',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabTitle: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default TabBar;