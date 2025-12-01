// src/screens/UploadScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet,  View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { uploadService } from '../services';
import { FashionCategory } from '../types/fashion.types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const CATEGORIES: { label: string; value: FashionCategory; icon: string }[] = [
  { label: 'Shoes', value: 'shoes', icon: '👟' },
  { label: 'Dresses', value: 'dresses', icon: '👗' },
  { label: 'Hats', value: 'hats', icon: '🎩' },
  { label: 'Suits', value: 'suits', icon: '🤵' },
  { label: 'Accessories', value: 'accessories', icon: '👜' },
  { label: 'Shirts', value: 'shirts', icon: '👔' },
  { label: 'Blouses', value: 'blouses', icon: '👚' },
  { label: 'Belts', value: 'belts', icon: '🔗' },
  { label: 'Ties', value: 'ties', icon: '👔' },
];

export const UploadScreen: React.FC = () => {
  const { user, hasPremiumAccess } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FashionCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremium();
    requestPermissions();
  }, []);

  const checkPremium = async () => {
    const premium = await hasPremiumAccess();
    setIsPremium(premium);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
    }
  };

  const pickImage = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Uploading fashion items is a premium feature. Upgrade to premium to unlock!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {/* Navigate to subscription */} },
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Uploading fashion items is a premium feature. Upgrade to premium to unlock!'
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !selectedCategory || !user) {
      Alert.alert('Error', 'Please select an image and category');
      return;
    }

    try {
      setIsUploading(true);

      const response = await uploadService.uploadFashionImage({
        user_id: user.id,
        category: selectedCategory,
        image_uri: selectedImage,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Upload failed');
      }

      Alert.alert(
        'Success!',
        'Your fashion item has been submitted for review. You\'ll be notified once it\'s approved!',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              setSelectedCategory(null);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Fashion</Text>
        {!isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialIcons name="lock" size={16} color={theme.colors.white} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        Share your fashion items with the community!
      </Text>

      {/* Image Selection */}
      <Card style={styles.imageCard}>
        {selectedImage ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={64} color={theme.colors.gray} />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.imageActions}>
          <Button
            title="Choose from Gallery"
            onPress={pickImage}
            variant="outline"
            style={styles.imageButton}
          />
          <Button
            title="Take Photo"
            onPress={takePhoto}
            variant="outline"
            style={styles.imageButton}
          />
        </View>
      </Card>

      {/* Category Selection */}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryCard,
              selectedCategory === category.value && styles.categoryCardActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.value && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload Button */}
      <Button
        title="Upload Fashion Item"
        onPress={handleUpload}
        loading={isUploading}
        disabled={!selectedImage || !selectedCategory || !isPremium}
        fullWidth
        size="large"
        style={styles.uploadButton}
      />

      {/* Guidelines */}
      <Card style={styles.guidelinesCard}>
        <Text style={styles.guidelinesTitle}>Upload Guidelines</Text>
        <View style={styles.guideline}>
          <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.guidelineText}>Clear, well-lit photos</Text>
        </View>
        <View style={styles.guideline}>
          <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.guidelineText}>Single item per photo</Text>
        </View>
        <View style={styles.guideline}>
          <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.guidelineText}>Appropriate content only</Text>
        </View>
        <View style={styles.guideline}>
          <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.guidelineText}>No watermarks or logos</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  premiumText: {
    ...theme.text.caption,
    color: theme.colors.white,
    fontWeight: '700',
    marginLeft: 4,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xl,
  },
  imageCard: {
    marginBottom: theme.spacing.xl,
  },
  imagePreview: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.gray + '10',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginTop: theme.spacing.sm,
  },
  imageActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  imageButton: {
    flex: 1,
  },
  sectionTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  categoryLabel: {
    ...theme.text.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: theme.colors.primary,
  },
  uploadButton: {
    marginBottom: theme.spacing.xl,
  },
  guidelinesCard: {
    backgroundColor: theme.colors.success + '10',
  },
  guidelinesTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  guidelineText: {
    ...theme.text.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
});
