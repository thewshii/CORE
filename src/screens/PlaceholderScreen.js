import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome to CORE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlaceholderScreen;