import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PassengerMapView from './PassengerMapView';
import PassengerProfile from './PassengerProfile';
import RideOptionsCard from '../../components/RideOptionsCard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define a Stack Navigator as a separate component
function RideStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PassengerMapView" component={PassengerMapView} options={{ headerShown: false }} />
      <Stack.Screen name="RideOptionsCard" component={RideOptionsCard} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Integrate the Stack Navigator within the Tab Navigator
function PassengerDashboard() {
  return (
    <Tab.Navigator>
      {/* Use the Stack Navigator as one of the tabs */}
      <Tab.Screen name="RideStack" component={RideStack} options={{ headerShown: false, title: 'Map' }} />
      <Tab.Screen name="Profile" component={PassengerProfile} />
    </Tab.Navigator>
  );
}

export default PassengerDashboard;
