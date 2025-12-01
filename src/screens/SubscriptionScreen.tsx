// src/screens/SubscriptionScreen.tsx
import React, { useState } from 'react';
import { StyleSheet,  View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS, PREMIUM_FEATURES } from '../types/subscription.types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

type SubscriptionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Subscription'
>;

interface Props {
  navigation: SubscriptionScreenNavigationProp;
}

const FEATURES = [
  { icon: 'people', text: 'Multiplayer Mode', premium: true },
  { icon: 'groups', text: 'Team Competitions', premium: true },
  { icon: 'cloud-upload', text: 'Upload Your Fashion', premium: true },
  { icon: 'auto-awesome', text: 'Premium AI Fashion Packs', premium: true },
  { icon: 'leaderboard', text: 'Advanced Leaderboards', premium: true },
  { icon: 'block', text: 'Ad-Free Experience', premium: true },
  { icon: 'emoji-events', text: 'Special Events & Tournaments', premium: true },
  { icon: 'person', text: 'Single Player Mode', premium: false },
  { icon: 'bar-chart', text: 'Basic Stats', premium: false },
];

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = SUBSCRIPTION_PLANS[0]; // Annual plan

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);

      // TODO: Integrate Stripe payment
      // For now, show alert
      Alert.alert(
        'Payment Integration',
        'Stripe payment integration will be added here. This will process the $9.99/year subscription.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Simulate successful payment
              Alert.alert(
                'Success!',
                'Your subscription has been activated! (Demo mode)',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchase',
      'This will restore your previous subscription if you already purchased it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            // TODO: Implement restore purchase
            Alert.alert('Info', 'Restore purchase functionality will be implemented with Stripe.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="workspace-premium" size={64} color={theme.colors.warning} />
          </View>
          <Text style={styles.title}>Go Premium!</Text>
          <Text style={styles.subtitle}>
            Unlock all features and compete with players worldwide
          </Text>
        </View>

        {/* Pricing Card */}
        <Card style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.period}>/year</Text>
          </View>

          <Text style={styles.priceSubtext}>
            That's only ${(plan.price / 12).toFixed(2)}/month!
          </Text>

          <View style={styles.divider} />

          <Text style={styles.planDescription}>{plan.description}</Text>
        </Card>

        {/* Features List */}
        <Text style={styles.featuresTitle}>What's Included</Text>
        
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={[
              styles.featureIcon,
              { backgroundColor: feature.premium ? theme.colors.primary + '20' : theme.colors.gray + '20' }
            ]}>
              <MaterialIcons
                name={feature.icon as any}
                size={24}
                color={feature.premium ? theme.colors.primary : theme.colors.gray}
              />
            </View>
            <Text style={[
              styles.featureText,
              !feature.premium && styles.featureTextFree
            ]}>
              {feature.text}
            </Text>
            {feature.premium && (
              <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
            )}
          </View>
        ))}

        {/* CTA Button */}
        <Button
          title={`Subscribe for $${plan.price}/year`}
          onPress={handleSubscribe}
          loading={isProcessing}
          fullWidth
          size="large"
          style={styles.subscribeButton}
        />

        {/* Restore Purchase */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Payment will be charged to your account. Subscription automatically renews unless
          auto-renew is turned off at least 24 hours before the end of the current period.
        </Text>

        <View style={styles.links}>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  content: {
    padding: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.text.h1,
    fontSize: 36,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  pricingCard: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  planName: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginRight: theme.spacing.sm,
  },
  bestValueBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  bestValueText: {
    ...theme.text.caption,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  currency: {
    ...theme.text.h2,
    color: theme.colors.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  price: {
    ...theme.text.h1,
    fontSize: 56,
    color: theme.colors.primary,
    fontWeight: '700',
    lineHeight: 56,
  },
  period: {
    ...theme.text.h3,
    color: theme.colors.gray,
    marginTop: 24,
  },
  priceSubtext: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: theme.spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.gray + '30',
    marginVertical: theme.spacing.md,
  },
  planDescription: {
    ...theme.text.body,
    color: theme.colors.text,
    textAlign: 'center',
  },
  featuresTitle: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    ...theme.text.body,
    color: theme.colors.text,
    flex: 1,
  },
  featureTextFree: {
    color: theme.colors.gray,
  },
  subscribeButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.md,
  },
  restoreText: {
    ...theme.text.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  terms: {
    ...theme.text.caption,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  linkText: {
    ...theme.text.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  linkSeparator: {
    ...theme.text.caption,
    color: theme.colors.gray,
    marginHorizontal: theme.spacing.sm,
  },
});
