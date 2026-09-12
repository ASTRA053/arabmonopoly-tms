import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { submitCurrentLocation } from './DriverData';

export const BACKGROUND_LOCATION_TASK = 'arabmonopoly-driver-location';
const TRACKING_SESSION_KEY = 'arabmonopoly-background-location-session';

async function submitBackgroundLocations(locations) {
  const session = await AsyncStorage.getItem(TRACKING_SESSION_KEY);
  if (!session) return;
  const { token, vehicleId } = JSON.parse(session);
  for (const location of locations || []) {
    await submitCurrentLocation(token, vehicleId, location.coords);
  }
}

if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (!error) await submitBackgroundLocations(data?.locations);
  });
}

export async function isBackgroundLocationTracking() {
  if (Platform.OS === 'web') return false;
  return Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
}

export async function startBackgroundLocationTracking(token, vehicleId) {
  if (Platform.OS === 'web') throw new Error('Background tracking is available in the installed Android app only.');
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) throw new Error('Location permission is required to start tracking.');
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) throw new Error('Allow all-the-time location access to continue tracking during an active trip.');
  await AsyncStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify({ token, vehicleId }));
  if (!await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 150,
      timeInterval: 60000,
      foregroundService: {
        notificationTitle: 'Arabmonopoly trip tracking',
        notificationBody: 'Your location is being shared with dispatch for the active trip.',
        notificationColor: '#0f766e',
      },
    });
  }
}

export async function stopBackgroundLocationTracking() {
  if (Platform.OS !== 'web' && await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
  await AsyncStorage.removeItem(TRACKING_SESSION_KEY);
}