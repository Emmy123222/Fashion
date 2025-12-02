// Web-only Subscription Screen with Stripe Checkout
// This screen is ONLY for website payments, NOT for mobile app

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscription.service';
import { Loader } from '../components/common/Loader';

export const SubscriptionWebScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [user]);

  const loadSubscriptionStatus = async () => {
    if (!user) return;

    setCheckingStatus(true);
    const response = await subscriptionService.getUserSubscription(user.id);
    
    if (response.success && response.data) {
      setSubscriptionStatus(response.data);
    }
    
    setCheckingStatus(false);
  };

  const handleSubscribe = async () => {
    // Check if running on mobile app
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Website Only',
        'Subscriptions must be purchased through our website. Please visit fashionmatchgame.com to subscribe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Website', 
            onPress: () => Linking.openURL('https://fashionmatchgame.com/subscribe')
          }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      const currentUrl = window.location.origin;
      const response = await subscriptionService.createStripeCheckoutSession(
        `${currentUrl}/subscription/success`,
        `${currentUrl}/subscription/cancel`
      );

      if (response.success && response.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error?.message || 'Failed to create checkout session');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  const isActive = subscriptionStatus?.status === 'paid' && 
                   (!subscriptionStatus?.expires_at || new Date(subscriptionStatus.expires_at) > new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Premium Subscription</Text>
        <Text style={styles.subtitle}>Unlock all premium features</Text>
      </View>

      {isActive ? (
        <View style={styles.activeCard}>
          <MaterialIcons name="check-circle" size={64} color={theme.colors.success} />
          <Text style={styles.activeTitle}>You're Premium!</Text>
          <Text style={styles.activeText}>
            Your subscription is active until{' '}
            {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>per year</Text>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            
            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Unlimited game plays</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Access to all difficulty levels</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Unlock all fashion categories</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Ad-free experience</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Priority customer support</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="check" size={24} color={theme.colors.success} />
              <Text style={styles.featureText}>Exclusive premium items</Text>
            </View>
          </View>

          {Platform.OS === 'web' ? (
            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <MaterialIcons name="credit-card" size={24} color={theme.colors.white} />
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.mobileNotice}>
              <MaterialIcons name="info" size={24} color={theme.colors.warning} />
              <Text style={styles.mobileNoticeText}>
                Subscriptions must be purchased through our website
              </Text>
              <TouchableOpacity
                style={styles.websiteButton}
                onPress={() => Linking.openURL('https://fashionmatchgame.com/subscribe')}
              >
                <Text style={styles.websiteButtonText}>Open Website</Text>
                <MaterialIcons name="open-in-new" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.disclaimer}>
            Secure payment powered by Stripe. Cancel anytime.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
  },
  activeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.success,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  activeText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.white,
  },
  pricePeriod: {
    fontSize: 18,
    color: theme.colors.white,
    opacity: 0.9,
  },
  featuresCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  mobileNotice: {
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mobileNoticeText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
