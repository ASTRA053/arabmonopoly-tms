import React from 'react';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList,
} from '@react-navigation/drawer';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverTripsScreen from '../screens/driver/DriverTripsScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { logout } = useAuth();
  const handleLogout = () => {
    props.navigation.closeDrawer();
    const confirmLogout = () => logout();
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to log out?');
      if (ok) confirmLogout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: confirmLogout },
      ]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.bottomArea}>
        <DrawerItem label="Logout" onPress={handleLogout} labelStyle={styles.logoutText} />
      </View>
    </View>
  );
}

export default function DriverDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="My dashboard" component={DriverDashboardScreen} />
      <Drawer.Screen name="My trips" component={DriverTripsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  bottomArea: { paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  logoutText: { color: '#b91c1c', fontWeight: '700' },
});