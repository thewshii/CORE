import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Alert, Platform, ToastAndroid } from 'react-native';
import supabase from '../../supabase/supabaseClient';
import ConfirmationModal from '../../components/ConfirmationModal';
import RNPickerSelect from 'react-native-picker-select';

function ConfirmBookingScreen() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [rideType, setRideType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const displayError = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !destinationLocation || !rideType) {
      displayError('Please fill in all fields including ride type.');
      return;
    }
    try {
      const { data, error } = await supabase.from('ride_bookings').insert([
        {
          pickupLocation,
          dropoffLocation: destinationLocation,
          rideType,
          status: 'pending',
        },
      ]);
      if (error) throw error;
      Alert.alert('Success', 'Ride booked successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Booking error:', error.message, error.stack);
      displayError('Failed to book the ride.');
    }
  };

  const handleBookRidePreConfirm = () => {
    setModalVisible(true);
  };

  const handleBookingConfirmation = () => {
    handleBookRide();
  };

  const handleBookingCancellation = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder='Pickup Location'
        value={pickupLocation}
        onChangeText={setPickupLocation}
        style={styles.input}
      />
      <TextInput
        placeholder='Destination Location'
        value={destinationLocation}
        onChangeText={setDestinationLocation}
        style={styles.input}
      />
      <RNPickerSelect
        onValueChange={setRideType}
        items={[
          { label: 'Premium', value: 'premium' },
          { label: 'Economy', value: 'economy' },
          { label: 'SUV', value: 'suv' },
        ]}
        style={{ inputAndroid: styles.input, inputIOS: styles.input }}
      />
      <Button title='Book Ride' onPress={handleBookRidePreConfirm} />
      <ConfirmationModal
        visible={modalVisible}
        onConfirm={handleBookingConfirmation}
        onCancel={handleBookingCancellation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    marginVertical: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default ConfirmBookingScreen;