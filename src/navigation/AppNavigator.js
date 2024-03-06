import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import DriverDashboard from '../screens/DriverDashboard'; // Placeholder import
import PassengerDashboard from '../screens/PassengerDashboard'; // Placeholder import
import { Provider } from 'react-redux';
import { configureStore } from "@reduxjs/toolkit";
import navReducer from "../slices/navSlice";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const store = configureStore({
    reducer: {
        nav: navReducer,
    },
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
        <Stack.Screen name='DriverDashboard' component={DriverDashboard} options={{headerShown: false}}/>
        <Stack.Screen name='PassengerDashboard' component={PassengerDashboard} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
    </Provider>
  );
}

export default AppNavigator;