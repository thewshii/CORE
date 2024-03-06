import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverMapView from './driver/DriverMapView';
import DriverProfile from './driver/DriverProfile';

const Tab = createBottomTabNavigator();

function DriverDashboard() {

  return (
    <>
      <Tab.Navigator>
        <Tab.Screen name="Map" component={DriverMapView} options={{ headerShown: false, tabBarLabel: 'Map'}} />
        <Tab.Screen name="Profile" component={DriverProfile} options={{ tabBarLabel: 'Profile'}} />
      </Tab.Navigator>
    </>
  );
}

export default DriverDashboard;