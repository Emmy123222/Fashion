// src/screens/admin/AdminDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet,  View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { uploadService, subscriptionService } from '../../services';
import { Card } from '../../components/common/Card';

export const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    pendingUploads: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load upload stats
      const uploadStats = await uploadService.getUploadStats();
      if (uploadStats.success && uploadStats.data) {
        setStats(prev => ({ ...prev, pendingUploads: uploadStats.data.pending });
      }

      // Load subscription stats
      const subStats = await subscriptionService.getSubscriptionStats();
      if (subStats.success && subStats.data) {
        setStats(prev => ({
          ...prev,
          activeSubscriptions: subStats.data.active_subscriptions,
          totalRevenue: subStats.data.total_revenue,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  const MenuCard = ({ icon, title, subtitle, onPress, color }: any) => (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.menuCard}>
        <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.gray} />
      </Card>
    </TouchableOpacity>
  );

  if (!user?.is_admin) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorized}>
          <MaterialIcons name="block" size={64} color={theme.colors.danger} />
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>
            You don't have permission to access the admin dashboard.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {user.username}!</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="pending-actions"
          title="Pending Uploads"
          value={stats.pendingUploads}
          color={theme.colors.warning}
        />
        <StatCard
          icon="people"
          title="Total Users"
          value={stats.totalUsers}
          color={theme.colors.primary}
        />
        <StatCard
          icon="workspace-premium"
          title="Active Subs"
          value={stats.activeSubscriptions}
          color={theme.colors.success}
        />
        <StatCard
          icon="attach-money"
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(0)}`}
          color={theme.colors.success}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <MenuCard
        icon="check-circle"
        title="Upload Approval"
        subtitle="Review pending fashion uploads"
        color={theme.colors.warning}
        onPress={() => {/* Navigate to upload approval */}}
      />

      <MenuCard
        icon="people"
        title="User Management"
        subtitle="Manage users and permissions"
        color={theme.colors.primary}
        onPress={() => {/* Navigate to user management */}}
      />

      <MenuCard
        icon="leaderboard"
        title="Leaderboard Control"
        subtitle="Manage rankings and scores"
        color={theme.colors.success}
        onPress={() => {/* Navigate to leaderboard control */}}
      />

      <MenuCard
        icon="bar-chart"
        title="Analytics"
        subtitle="View detailed statistics"
        color={theme.colors.secondary}
        onPress={() => {/* Navigate to analytics */}}
      />

      <MenuCard
        icon="flag"
        title="Content Moderation"
        subtitle="Review reported content"
        color={theme.colors.danger}
        onPress={() => {/* Navigate to moderation */}}
      />
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
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    ...theme.text.h1,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    ...theme.text.caption,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  sectionTitle: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...theme.text.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  unauthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  unauthorizedText: {
    ...theme.text.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  unauthorizedSubtext: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
