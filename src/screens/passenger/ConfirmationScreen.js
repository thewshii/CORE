import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { calculateFare } from '../../utils/fareCalculator';

const ConfirmationScreen = ({ navigation }) => {
  const [estimatedFare, setEstimatedFare] = useState('');

  const fetchEstimatedFare = async () => {
    const origin = { lat: 34.052235, lng: -118.243683 };
    const destination = { lat: 34.052235, lng: -118.243683 };
    const multiplier = 1;
    try {
      const fare = await calculateFare(origin, destination, multiplier);
      setEstimatedFare(fare);
    } catch (error) {
      console.error('Error calculating fare:', error.message); // gpt_pilot_debugging_log
    }
  };

  useEffect(() => {
    fetchEstimatedFare();
  }, []);

  const handleOkPress = () => {
    navigation.goBack();
    console.log('Confirmation accepted, navigating back.'); // Log confirmation acceptance
  };

  return (
    <View style={styles.container}>
      <Text>Estimated Fare: ${estimatedFare}</Text>
      <Button title="Confirm Booking" onPress={handleOkPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConfirmationScreen;