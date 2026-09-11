import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import LoginScreen from './screens/auth/LoginScreen';
import AdminDrawer from './navigation/AdminDrawer';
import DriverDrawer from './navigation/DriverDrawer';

const Stack = createNativeStackNavigator();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f5f7fb' } };

function RootNavigator() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : currentUser.role === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminDrawer} />
        ) : (
          <Stack.Screen name="DriverApp" component={DriverDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RootNavigator />
      </DataProvider>
    </AuthProvider>
  );
}