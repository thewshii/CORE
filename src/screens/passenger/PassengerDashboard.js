import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PassengerMapView from './PassengerMapView';
import PassengerProfile from './PassengerProfile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function PassengerDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Map" component={PassengerMapView} options={{ headerShown: false, title: 'Map' }} />
      <Tab.Screen name="Profile" component={PassengerProfile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default PassengerDashboard;