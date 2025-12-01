// src/screens/onboarding/OnboardingScreen.tsx
import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import React, { useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
  ImageStyle,
  TextStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Onboarding'
>;

type Slide = {
  id: string;
  title: string;
  description: string;
  image: any; // You might want to use a more specific type for the image
};

type Props = {
  navigation: OnboardingScreenNavigationProp;
};

const { width } = Dimensions.get('window');

const onboardingSlides: Slide[] = [
  {
    id: '1',
    title: 'Discover Fashion',
    description: 'Find the latest trends and styles that match your personality',
    image: require('../../assets/onboarding1.png'), // Make sure to add these images
  },
  {
    id: '2',
    title: 'Create Outfits',
    description: 'Mix and match clothes to create your perfect look',
    image: require('../../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Share & Get Inspired',
    description: 'Share your style and get inspired by others in the community',
    image: require('../../assets/onboarding3.png'),
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList<Slide>>(null);

  const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentIndex + 1;
    if (nextSlideIndex < onboardingSlides.length) {
      const offset = nextSlideIndex * width;
      slidesRef.current?.scrollToOffset({ offset, animated: true });
      setCurrentIndex(nextSlideIndex);
    } else {
      navigation.replace('Register');
    }
  };

  const skipOnboarding = () => {
    navigation.replace('Register');
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <Image 
        source={item.image} 
        style={styles.image} 
        resizeMode="contain"
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingSlides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentIndex === index && styles.paginationDotActive
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={slidesRef}
        data={onboardingSlides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
      />

      {renderPagination()}

      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={goToNextSlide}
        activeOpacity={0.8}
      >
        <MaterialIcons 
          name={currentIndex === onboardingSlides.length - 1 ? "check" : "arrow-forward"} 
          size={24} 
          color={theme.colors.white} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    ...theme.text.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});