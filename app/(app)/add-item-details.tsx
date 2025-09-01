import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import WardrobeService from '@/services/wardrobeService';
import { useWardrobeActions } from '@/store/wardrobeStore';
import SuccessFeedback from '@/components/SuccessFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Color {
  id: string;
  name: string;
  hex: string;
}

const CATEGORIES: Category[] = [
  { id: 'tops', name: 'Üst Giyim', icon: 'shirt-outline' },
  { id: 'bottoms', name: 'Alt Giyim', icon: 'fitness-outline' },
  { id: 'dresses', name: 'Elbise', icon: 'woman-outline' },
  { id: 'shoes', name: 'Ayakkabı', icon: 'footsteps-outline' },
  { id: 'accessories', name: 'Aksesuar', icon: 'watch-outline' },
  { id: 'outerwear', name: 'Dış Giyim', icon: 'umbrella-outline' },
];

const COLORS: Color[] = [
  { id: 'black', name: 'Siyah', hex: '#000000' },
  { id: 'white', name: 'Beyaz', hex: '#FFFFFF' },
  { id: 'gray', name: 'Gri', hex: '#808080' },
  { id: 'navy', name: 'Lacivert', hex: '#000080' },
  { id: 'blue', name: 'Mavi', hex: '#0066CC' },
  { id: 'red', name: 'Kırmızı', hex: '#CC0000' },
  { id: 'green', name: 'Yeşil', hex: '#00AA00' },
  { id: 'yellow', name: 'Sarı', hex: '#FFCC00' },
  { id: 'pink', name: 'Pembe', hex: '#FF69B4' },
  { id: 'purple', name: 'Mor', hex: '#800080' },
  { id: 'brown', name: 'Kahverengi', hex: '#8B4513' },
  { id: 'beige', name: 'Bej', hex: '#F5F5DC' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface AddItemDetailsScreenProps {}

const AddItemDetailsScreen: React.FC<AddItemDetailsScreenProps> = () => {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { addItem } = useWardrobeActions();
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    color: '',
    size: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  
  // Reanimated shared values
  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.95);
  const submitButtonScale = useSharedValue(1);

  // Animation on mount
  useEffect(() => {
    fadeValue.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    scaleValue.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
    
    // Show smart suggestions based on category
    if (categoryId && !showSmartSuggestions) {
      setShowSmartSuggestions(true);
      // Auto-suggest common sizes based on category
      if (categoryId === 'shoes' && !formData.size) {
        // Don't auto-select, just highlight common sizes
      } else if ((categoryId === 'tops' || categoryId === 'bottoms') && !formData.size) {
        // Highlight M as most common
      }
    }
  }, [showSmartSuggestions, formData.size]);

  const handleColorSelect = useCallback((colorId: string) => {
    setFormData(prev => ({ ...prev, color: colorId }));
  }, []);

  const handleSizeSelect = useCallback((size: string) => {
    setFormData(prev => ({ ...prev, size }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert('Uyarı', 'Lütfen ürün adını girin.');
      return;
    }

    if (!formData.category) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Uyarı', 'Lütfen bir görüntü seçin.');
      return;
    }

    // Animate submit button
    submitButtonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      submitButtonScale.value = withSpring(1, { duration: 200 });
    }, 100);

    try {
      setIsSubmitting(true);
      
      // Create wardrobe item using Zustand store
      const newItem = {
        id: Date.now().toString(), // Temporary ID, will be replaced by server
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        color: formData.color,
        size: formData.size,
        notes: formData.notes,
        imageUri: imageUri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addItem(newItem);
      
      // Show success feedback animation
      runOnJS(() => {
        setShowSuccessFeedback(true);
      })();
    } catch (error) {
      console.error('Submit error:', error);
      runOnJS(() => {
        Alert.alert(
          'Hata',
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
          [{ text: 'Tamam' }]
        );
      })();
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, imageUri, addItem]);

  const handleSuccessComplete = useCallback(() => {
    setShowSuccessFeedback(false);
    router.dismissAll();
    router.push('/wardrobe');
  }, []);

  const renderCategorySelector = () => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeValue.value,
        transform: [{ scale: scaleValue.value }],
      };
    });

    return (
      <Animated.View style={[styles.sectionContainer, animatedStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <Text style={styles.sectionSubtitle}>Parçanızın türünü seçin</Text>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category, index) => {
            const isSelected = formData.category === category.id;
            
            const itemAnimatedStyle = useAnimatedStyle(() => {
              return {
                opacity: fadeValue.value,
                transform: [
                  {
                    translateY: interpolate(
                      fadeValue.value,
                      [0, 1],
                      [20, 0]
                    ),
                  },
                ],
              };
            });

            return (
              <Animated.View key={category.id} style={itemAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                    styles.categoryItemEnhanced,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.name} kategorisi`}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.categoryIconContainer,
                    isSelected && styles.categoryIconContainerSelected
                  ]}>
                    <Ionicons
                      name={category.icon as any}
                      size={22}
                      color={
                        isSelected
                          ? DesignSystem.colors.gold[600]
                          : DesignSystem.colors.neutral[600]
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={DesignSystem.colors.gold[600]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderColorSelector = () => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeValue.value,
        transform: [{ scale: scaleValue.value }],
      };
    });

    return (
      <Animated.View style={[styles.sectionContainer, animatedStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Renk</Text>
          <Text style={styles.sectionSubtitle}>Dominant rengi seçin</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorScrollContainer}
        >
          {COLORS.map((color, index) => {
            const isSelected = formData.color === color.id;
            
            const itemAnimatedStyle = useAnimatedStyle(() => {
              return {
                opacity: fadeValue.value,
                transform: [
                  {
                    translateX: interpolate(
                      fadeValue.value,
                      [0, 1],
                      [30, 0]
                    ),
                  },
                ],
              };
            });

            return (
              <Animated.View key={color.id} style={itemAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.colorItem,
                    styles.colorItemEnhanced,
                    { backgroundColor: color.hex },
                    isSelected && styles.colorItemSelected,
                    color.hex === '#FFFFFF' && styles.whiteColorBorder,
                  ]}
                  onPress={() => handleColorSelect(color.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${color.name} rengi`}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.colorCheckContainer}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={color.hex === '#FFFFFF' || color.hex === '#FFCC00' ? '#000' : '#FFF'}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={[
                  styles.colorLabel,
                  isSelected && styles.colorLabelSelected
                ]}>
                  {color.name}
                </Text>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderSizeSelector = () => {
    const getSizeRecommendation = (size: string) => {
      if (formData.category === 'shoes') return false;
      return size === 'M' && showSmartSuggestions && !formData.size;
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeValue.value,
        transform: [{ scale: scaleValue.value }],
      };
    });

    return (
      <Animated.View style={[styles.sectionContainer, animatedStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Beden</Text>
          <Text style={styles.sectionSubtitle}>Size bilgisini seçin</Text>
        </View>
        <View style={styles.sizeGrid}>
          {SIZES.map((size, index) => {
            const isSelected = formData.size === size;
            const isRecommended = getSizeRecommendation(size);
            
            const itemAnimatedStyle = useAnimatedStyle(() => {
              return {
                opacity: fadeValue.value,
                transform: [
                  {
                    translateY: interpolate(
                      fadeValue.value,
                      [0, 1],
                      [15, 0]
                    ),
                  },
                ],
              };
            });

            return (
              <Animated.View key={size} style={itemAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.sizeItem,
                    styles.sizeItemEnhanced,
                    isSelected && styles.sizeItemSelected,
                    isRecommended && styles.sizeItemRecommended,
                  ]}
                  onPress={() => handleSizeSelect(size)}
                  accessibilityRole="button"
                  accessibilityLabel={`${size} bedeni`}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isSelected && styles.sizeTextSelected,
                      isRecommended && styles.sizeTextRecommended,
                    ]}
                  >
                    {size}
                  </Text>
                  {isRecommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Popüler</Text>
                    </View>
                  )}
                  {isSelected && (
                    <View style={styles.sizeSelectedIndicator}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={DesignSystem.colors.gold[600]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.neutral[50], DesignSystem.colors.neutral[100]]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parça Detayları</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Image */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ürün Adı *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Örn: Beyaz Gömlek"
                placeholderTextColor={DesignSystem.colors.neutral[400]}
              />
            </View>

            {/* Brand Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Marka</Text>
              <TextInput
                style={styles.textInput}
                value={formData.brand}
                onChangeText={(value) => handleInputChange('brand', value)}
                placeholder="Örn: Zara, H&M"
                placeholderTextColor={DesignSystem.colors.neutral[400]}
              />
            </View>

            {/* Category Selector */}
            {renderCategorySelector()}

            {/* Color Selector */}
            {renderColorSelector()}

            {/* Size Selector */}
            {renderSizeSelector()}

            {/* Notes Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notlar</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Özel notlarınız..."
                placeholderTextColor={DesignSystem.colors.neutral[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Animated.View style={useAnimatedStyle(() => ({
              transform: [{ scale: submitButtonScale.value }],
            }))}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Parçayı kaydet"
              >
                <LinearGradient
                  colors={
                    isSubmitting
                      ? [DesignSystem.colors.neutral[400], DesignSystem.colors.neutral[500]]
                      : [DesignSystem.colors.gold[500], DesignSystem.colors.gold[600]]
                  }
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Kaydediliyor...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Gardıroba Ekle</Text>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
      
      {/* Success Feedback */}
      <SuccessFeedback
        visible={showSuccessFeedback}
        title="Başarılı!"
        message="Parçanız gardırobunuza başarıyla eklendi"
        onComplete={handleSuccessComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl + 20,
    paddingBottom: DesignSystem.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.neutral[800],
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  imageContainer: {
    marginBottom: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  selectedImage: {
    width: 120,
    height: 160,
    borderRadius: DesignSystem.borderRadius.lg,
    resizeMode: 'cover',
  },
  formContainer: {
    gap: DesignSystem.spacing.lg,
  },
  inputContainer: {
    gap: DesignSystem.spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.neutral[700],
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  textInput: {
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    fontSize: 16,
    color: DesignSystem.colors.neutral[800],
    fontFamily: DesignSystem.typography.fontFamily.regular,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  notesInput: {
    height: 80,
    paddingTop: DesignSystem.spacing.md,
  },
  sectionContainer: {
    gap: DesignSystem.spacing.md,
  },
  sectionHeader: {
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.neutral[700],
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: DesignSystem.colors.neutral[600],
    fontWeight: '400',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral[100],
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  categoryItemEnhanced: {
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItemSelected: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[300],
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  categoryIconContainerSelected: {
    backgroundColor: DesignSystem.colors.gold[100],
  },
  categoryText: {
    fontSize: 14,
    color: DesignSystem.colors.neutral[600],
    fontFamily: DesignSystem.typography.fontFamily.regular,
  },
  categoryTextSelected: {
    color: DesignSystem.colors.gold[700],
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  colorScrollContainer: {
    paddingHorizontal: DesignSystem.spacing.xs,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemEnhanced: {
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorItemSelected: {
    borderColor: DesignSystem.colors.gold[500],
  },
  whiteColorBorder: {
    borderColor: DesignSystem.colors.neutral[300],
  },
  colorCheckContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 2,
  },
  colorLabel: {
    fontSize: 11,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    marginTop: DesignSystem.spacing.xs,
    fontWeight: '500',
  },
  colorLabelSelected: {
    color: DesignSystem.colors.gold[700],
    fontWeight: '600',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  sizeItem: {
    backgroundColor: DesignSystem.colors.neutral[100],
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
    minWidth: 50,
    alignItems: 'center',
    position: 'relative',
  },
  sizeItemEnhanced: {
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sizeItemSelected: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[300],
  },
  sizeItemRecommended: {
    backgroundColor: DesignSystem.colors.blue[50],
    borderColor: DesignSystem.colors.blue[200],
    borderWidth: 1.5,
  },
  sizeText: {
    fontSize: 14,
    color: DesignSystem.colors.neutral[600],
    fontFamily: DesignSystem.typography.fontFamily.regular,
  },
  sizeTextSelected: {
    color: DesignSystem.colors.gold[700],
    fontWeight: '600',
  },
  sizeTextRecommended: {
    color: DesignSystem.colors.blue[700],
    fontWeight: '600',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: DesignSystem.colors.blue[500],
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
  },
  sizeSelectedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: DesignSystem.colors.gold[100],
    borderRadius: 8,
    padding: 2,
  },
  submitContainer: {
    marginTop: DesignSystem.spacing.xl,
  },
  submitButton: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  submitButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.05,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.lg + 2,
    paddingHorizontal: DesignSystem.spacing.xl,
    gap: DesignSystem.spacing.sm,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.bold,
  },
});

export default AddItemDetailsScreen;