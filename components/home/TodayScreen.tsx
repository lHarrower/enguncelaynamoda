import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';
import { useStyleDNA } from '@/hooks/useStyleDNA';
import { useGlobalStore } from '@/store/globalStore';
import { outfitService, OutfitRecommendation } from '@/services/outfitService';

const { width: screenWidth } = Dimensions.get('window');



const TodayScreen: React.FC = () => {
  const [todayOutfit, setTodayOutfit] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { styleDNA } = useStyleDNA();
  const user = useGlobalStore(state => state.user);

  useEffect(() => {
    loadTodayOutfit();
  }, []);

  const loadTodayOutfit = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      
      const outfit = await outfitService.getTodayOutfit(user.id, styleDNA);
      setTodayOutfit(outfit);
    } catch (error) {
      console.error('Error loading today outfit:', error);
      Alert.alert('Hata', 'Bugünün kombini yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodayOutfit();
    setRefreshing(false);
  };

  const handleWorn = async () => {
    if (!todayOutfit || !user?.id) return;
    
    try {
      await outfitService.markAsWorn(todayOutfit.id, user.id);
      Alert.alert(
        'Kombini Giydin! 👗',
        'Harika! Bu kombin gardırobunda "Giyildi" olarak işaretlendi.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Kombin işaretlenirken bir hata oluştu.');
    }
  };

  const handleChange = () => {
    Alert.alert(
      'Yeni Kombin',
      'Yeni bir kombin önerisi hazırlansın mı?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: generateNewOutfit }
      ]
    );
  };

  const generateNewOutfit = async () => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      const newOutfit = await outfitService.generateOutfit(user.id, {
        styleDNA,
        excludeItems: todayOutfit?.items.map(item => item.id)
      });
      setTodayOutfit(newOutfit);
    } catch (error) {
      Alert.alert('Hata', 'Yeni kombin oluşturulurken bir hata oluştu.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!todayOutfit || !user?.id) return;
    
    try {
      await outfitService.saveOutfit(todayOutfit.id, user.id);
      Alert.alert(
        'Kombin Kaydedildi! ⭐',
        'Bu kombin favorilerine eklendi.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Kombin kaydedilirken bir hata oluştu.');
    }
  };

  const renderOutfitItem = (item: OutfitItem, index: number) => (
    <View key={item.id} style={styles.outfitItem}>
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.itemGradient}
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>{item.color} • {item.brand}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="shirt-outline" size={48} color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>Bugünün kombini hazırlanıyor...</Text>
        </View>
      </View>
    );
  }

  if (!todayOutfit) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={DesignSystem.colors.error} />
        <Text style={styles.errorText}>Kombin yüklenemedi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTodayOutfit}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Günaydın, {user?.name || 'Güzel'}! ☀️
          </Text>
          <Text style={styles.subtitle}>Bugün için özel kombin önerim</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={DesignSystem.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Weather & Occasion */}
      <View style={styles.contextContainer}>
        <View style={styles.contextItem}>
          <Ionicons name="sunny" size={20} color={DesignSystem.colors.warning} />
          <Text style={styles.contextText}>{todayOutfit.weather.description}</Text>
        </View>
        <View style={styles.contextItem}>
          <Ionicons name="briefcase" size={20} color={DesignSystem.colors.primary} />
          <Text style={styles.contextText}>{todayOutfit.occasion}</Text>
        </View>
        <View style={styles.contextItem}>
          <Ionicons name="heart" size={20} color={DesignSystem.colors.error} />
          <Text style={styles.contextText}>%{todayOutfit.styleMatch} Uyum</Text>
        </View>
      </View>

      {/* Outfit Display */}
      <View style={styles.outfitContainer}>
        <LinearGradient
          colors={[DesignSystem.colors.background, DesignSystem.colors.surface]}
          style={styles.outfitGradient}
        >
          <View style={styles.outfitGrid}>
            {todayOutfit.items.map((item, index) => renderOutfitItem(item, index))}
          </View>
        </LinearGradient>
      </View>

      {/* Style DNA Match */}
      {styleDNA && (
        <View style={styles.styleDNAContainer}>
          <View style={styles.styleDNAHeader}>
            <Ionicons name="diamond" size={20} color={DesignSystem.colors.primary} />
            <Text style={styles.styleDNATitle}>Stil DNA'na Uygun</Text>
          </View>
          <Text style={styles.styleDNADescription}>
            Bu kombin {styleDNA.personality} tarzına %{todayOutfit.styleMatch} uyumlu
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.wornButton]} onPress={handleWorn}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.actionButtonText}>Giydim</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.changeButton]} onPress={handleChange}>
          <Ionicons name="refresh-circle" size={24} color={DesignSystem.colors.primary} />
          <Text style={[styles.actionButtonText, { color: DesignSystem.colors.primary }]}>Değiştir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
          <Ionicons name="heart-circle" size={24} color={DesignSystem.colors.error} />
          <Text style={[styles.actionButtonText, { color: DesignSystem.colors.error }]}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background,
    padding: 24,
  },
  errorText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    ...DesignSystem.typography.button,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 60,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.textSecondary,
  },
  refreshButton: {
    padding: 8,
  },
  contextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: DesignSystem.colors.surface,
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text,
    marginLeft: 6,
  },
  outfitContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  outfitGradient: {
    padding: 24,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitItem: {
    width: (screenWidth - 96) / 2,
    marginBottom: 16,
  },
  itemImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  itemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  itemGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  itemInfo: {
    paddingHorizontal: 4,
  },
  itemName: {
    ...DesignSystem.typography.subtitle,
    color: DesignSystem.colors.text,
    marginBottom: 2,
  },
  itemDetails: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.textSecondary,
  },
  styleDNAContainer: {
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  styleDNAHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleDNATitle: {
    ...DesignSystem.typography.subtitle,
    color: DesignSystem.colors.text,
    marginLeft: 8,
  },
  styleDNADescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  wornButton: {
    backgroundColor: DesignSystem.colors.success,
  },
  changeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
  },
  saveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.error,
  },
  actionButtonText: {
    ...DesignSystem.typography.button,
    color: 'white',
  },
};

export default TodayScreen;