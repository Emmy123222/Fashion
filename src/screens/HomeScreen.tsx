// src/screens/HomeScreen.tsx - Beautiful Landing Page
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { featureGate } from '../services/featureGate.service';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  const handlePlayPress = async () => {
    if (!user) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    // Check daily game limit
    const { canPlay, gamesLeft } = await featureGate.canPlayGame(user.id);
    
    if (!canPlay) {
      featureGate.showGameLimitPrompt(gamesLeft, navigation);
      return;
    }

    navigation.navigate('CategorySelection');
  };

  const features = [
    {
      icon: 'sports-esports',
      title: 'Match & Play',
      description: 'Test your fashion memory with exciting matching games',
      color: theme.colors.primary,
    },
    {
      icon: 'emoji-events',
      title: 'Compete',
      description: 'Challenge friends and climb the global leaderboards',
      color: theme.colors.warning,
    },
    {
      icon: 'collections',
      title: 'Collect',
      description: 'Unlock exclusive fashion items as you progress',
      color: theme.colors.success,
    },
    {
      icon: 'people',
      title: 'Multiplayer',
      description: 'Play with friends in real-time fashion battles',
      color: theme.colors.danger,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <MaterialIcons name="style" size={isSmallDevice ? 60 : 80} color={theme.colors.white} />
          <Text style={styles.heroTitle}>Fashion Match</Text>
          <Text style={styles.heroSubtitle}>
            The Ultimate Fashion Memory Game
          </Text>
          <Text style={styles.heroDescription}>
            Match fashion items, compete with players worldwide, and build your exclusive collection
          </Text>
          
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPress}
            activeOpacity={0.9}
          >
            <MaterialIcons name="play-arrow" size={32} color={theme.colors.primary} />
            <Text style={styles.playButtonText}>START PLAYING</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why You'll Love It</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <MaterialIcons name={feature.icon as any} size={32} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={[styles.section, styles.statsSection]}>
        <Text style={styles.sectionTitle}>Join the Community</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Fashion Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Play?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of fashion enthusiasts in the most addictive matching game
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePlayPress}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaButtonText}>GET STARTED</Text>
          <MaterialIcons name="arrow-forward" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for Fashion Lovers</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    backgroundColor: theme.colors.primary,
    paddingTop: isSmallDevice ? theme.spacing.xl : theme.spacing.xxl * 1.5,
    paddingBottom: isSmallDevice ? theme.spacing.xl : theme.spacing.xxl * 1.5,
    paddingHorizontal: theme.spacing.md,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: isSmallDevice ? 32 : isMediumDevice ? 40 : 48,
    fontWeight: '800',
    color: theme.colors.white,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  heroDescription: {
    fontSize: isSmallDevice ? 14 : 16,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    paddingHorizontal: isSmallDevice ? theme.spacing.xl : theme.spacing.xl * 2,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  playButtonText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  section: {
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 22 : isMediumDevice ? 24 : 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: isSmallDevice ? '100%' : '48%',
    backgroundColor: theme.colors.white,
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featureIcon: {
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    borderRadius: isSmallDevice ? 28 : 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    color: theme.colors.gray,
    lineHeight: isSmallDevice ? 18 : 20,
  },
  statsSection: {
    backgroundColor: theme.colors.primary + '10',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statCard: {
    alignItems: 'center',
    minWidth: isSmallDevice ? '30%' : 'auto',
  },
  statNumber: {
    fontSize: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: isSmallDevice ? 12 : 14,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  ctaSection: {
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
    marginVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaTitle: {
    fontSize: isSmallDevice ? 24 : isMediumDevice ? 28 : 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: isSmallDevice ? 14 : 16,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    paddingHorizontal: isSmallDevice ? theme.spacing.xl : theme.spacing.xl * 2,
    borderRadius: 30,
  },
  ctaButtonText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: theme.colors.white,
    marginRight: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: theme.colors.gray,
  },
});