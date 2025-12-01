// polyfills.js - Load all polyfills
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// Ensure Platform is available globally
import { Platform } from 'react-native';
if (typeof global.Platform === 'undefined') {
  global.Platform = Platform;
}
