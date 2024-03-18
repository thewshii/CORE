import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StyleSheet, AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/components/AuthContext';

console.log("Starting App...");

function App() {
  if (!store) {
    console.error("Redux store is not initialized."); // gpt_pilot_debugging_log
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProvider>   
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;