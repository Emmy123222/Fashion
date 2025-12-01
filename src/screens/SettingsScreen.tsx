// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { StyleSheet,  View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Account deletion will be implemented with backend integration.');
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showArrow = true,
    rightElement 
  }: any) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      {rightElement || (showArrow && (
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.gray} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Card padding="none">
        <SettingRow
          icon="person"
          title="Profile"
          value={user?.username || user?.email}
          onPress={() => Alert.alert('Info', 'Profile editing will be implemented')}
        />
        <SettingRow
          icon="workspace-premium"
          title="Subscription"
          value={user?.subscription_status === 'premium' ? 'Premium' : 'Free'}
          onPress={() => Alert.alert('Info', 'Navigate to subscription screen')}
        />
        <SettingRow
          icon="notifications"
          title="Notifications"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
            />
          }
        />
      </Card>

      {/* Audio Section */}
      <Text style={styles.sectionTitle}>Audio</Text>
      <Card padding="none">
        <SettingRow
          icon="volume-up"
          title="Sound Effects"
          rightElement={
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
            />
          }
        />
        <SettingRow
          icon="music-note"
          title="Background Music"
          rightElement={
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
            />
          }
        />
        <SettingRow
          icon="vibration"
          title="Vibration"
          rightElement={
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
            />
          }
        />
      </Card>

      {/* Game Section */}
      <Text style={styles.sectionTitle}>Game</Text>
      <Card padding="none">
        <SettingRow
          icon="speed"
          title="Difficulty"
          value="Auto-adjust"
          onPress={() => Alert.alert('Info', 'Difficulty settings will be implemented')}
        />
        <SettingRow
          icon="language"
          title="Language"
          value="English"
          onPress={() => Alert.alert('Info', 'Language selection will be implemented')}
        />
      </Card>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <Card padding="none">
        <SettingRow
          icon="help"
          title="Help & FAQ"
          onPress={() => Alert.alert('Info', 'Help center will be implemented')}
        />
        <SettingRow
          icon="feedback"
          title="Send Feedback"
          onPress={() => Alert.alert('Info', 'Feedback form will be implemented')}
        />
        <SettingRow
          icon="star"
          title="Rate App"
          onPress={() => Alert.alert('Info', 'App store rating will be implemented')}
        />
      </Card>

      {/* Legal Section */}
      <Text style={styles.sectionTitle}>Legal</Text>
      <Card padding="none">
        <SettingRow
          icon="description"
          title="Terms of Service"
          onPress={() => Alert.alert('Info', 'Terms of service will be displayed')}
        />
        <SettingRow
          icon="privacy-tip"
          title="Privacy Policy"
          onPress={() => Alert.alert('Info', 'Privacy policy will be displayed')}
        />
        <SettingRow
          icon="info"
          title="About"
          value="Version 1.0.0"
          showArrow={false}
        />
      </Card>

      {/* Actions */}
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        fullWidth
        style={styles.signOutButton}
      />

      <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Fashion Match Game</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for fashion lovers</Text>
      </View>
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
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    ...theme.text.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  settingValue: {
    ...theme.text.caption,
    color: theme.colors.gray,
    marginTop: 2,
  },
  signOutButton: {
    marginTop: theme.spacing.xl,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  deleteText: {
    ...theme.text.body,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  footerText: {
    ...theme.text.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
});
