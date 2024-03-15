import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/shared/LoginScreen';
import RegisterScreen from '../screens/shared/RegisterScreen';
import RoleSelectScreen from '../screens/shared/RoleSelectScreen';
import DriverDashboard from '../screens/driver/DriverDashboard';
import PassengerDashboard from '../screens/passenger/PassengerDashboard';
import { Provider } from 'react-redux';
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import navReducer from "../slices/navSlice";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConfirmationScreen from '../screens/passenger/ConfirmationScreen';
import DriverMapView from '../screens/driver/DriverMapView';
import PassengerMapView from '../screens/passenger/PassengerMapView';

export const store = configureStore({
    reducer: {
        nav: navReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

const Stack = createStackNavigator();

function AppNavigator() {
  console.log('Initializing App Navigator');

  return (
    <Provider store={store}>
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name='Login' component={LoginScreen} options={{headerShown: false}}/>
        <Stack.Screen name='Register' component={RegisterScreen} options={{headerShown: false}}/>
        <Stack.Screen name='RoleSelect' component={RoleSelectScreen} options={{headerShown: false}}/>
        <Stack.Screen name='DriverDashboard' component={DriverMapView} options={{headerShown: false}}/>
        <Stack.Screen name='PassengerDashboard' component={PassengerMapView} options={{headerShown: false}}/>
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
    </Provider>
  );
}

export default AppNavigator;