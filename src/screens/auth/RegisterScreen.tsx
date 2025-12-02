// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Alert, 
  ScrollView, 
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const AGE_GROUPS = ['Child', 'Teen', 'Adult'] as const;
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Japan', 'South Korea', 'China', 'India',
  'Brazil', 'Mexico', 'Argentina', 'South Africa', 'Nigeria', 'Egypt',
  'Other'
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [showAgeGroupPicker, setShowAgeGroupPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!username || !ageGroup || !country) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (username.length > 30) {
      Alert.alert('Error', 'Username must be at most 30 characters');
      return;
    }

    // Validate username format (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    try {
      setIsLoading(true);
      // Create a temporary email and password for the user
      const tempEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@fashionmatch.temp`;
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      await signUp({ 
        email: tempEmail, 
        password: tempPassword, 
        username, 
        full_name: username,
        player_type: ageGroup.toLowerCase() as 'child' | 'teen' | 'adult',
        country
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Username Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the fashion community</Text>
      </View>

      <View style={styles.form}>
        {/* Username Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color={theme.colors.gray} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={theme.colors.gray}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Age Group Picker */}
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowAgeGroupPicker(!showAgeGroupPicker)}
        >
          <MaterialIcons name="cake" size={24} color={theme.colors.gray} style={styles.icon} />
          <Text style={[styles.pickerText, !ageGroup && styles.placeholderText]}>
            {ageGroup || 'Select Age Group'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.gray} />
        </TouchableOpacity>

        {showAgeGroupPicker && (
          <View style={styles.pickerContainer}>
            {AGE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={styles.pickerItem}
                onPress={() => {
                  setAgeGroup(group);
                  setShowAgeGroupPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{group}</Text>
                {ageGroup === group && (
                  <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Country Picker */}
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowCountryPicker(!showCountryPicker)}
        >
          <MaterialIcons name="public" size={24} color={theme.colors.gray} style={styles.icon} />
          <Text style={[styles.pickerText, !country && styles.placeholderText]}>
            {country || 'Select Country'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.gray} />
        </TouchableOpacity>

        {showCountryPicker && (
          <ScrollView style={styles.pickerContainer} nestedScrollEnabled>
            {COUNTRIES.map((countryOption) => (
              <TouchableOpacity
                key={countryOption}
                style={styles.pickerItem}
                onPress={() => {
                  setCountry(countryOption);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{countryOption}</Text>
                {country === countryOption && (
                  <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing up, you agree to our 
            <Text style={styles.termsLink}> Terms of Service</Text> and 
            <Text style={styles.termsLink}> Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...theme.text.body,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.text.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  footerLink: {
    ...theme.text.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  termsText: {
    ...theme.text.caption,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pickerText: {
    flex: 1,
    ...theme.text.body,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.gray,
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    maxHeight: 200,
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
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '30',
  },
  pickerItemText: {
    ...theme.text.body,
    color: theme.colors.text,
  },
});