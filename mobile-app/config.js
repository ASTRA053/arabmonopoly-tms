import { Platform } from 'react-native';

// Use the computer's LAN address on a physical phone; keep localhost for Expo web.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web'
  ? 'http://localhost:4000/api'
  : 'http://10.176.158.251:4000/api');
