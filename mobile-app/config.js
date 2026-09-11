import { Platform } from 'react-native';

// Use the public API by default so installed APKs work outside the local Wi-Fi.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web'
  ? 'http://localhost:4000/api'
  : 'https://arabmonopoly-api.onrender.com/api');
