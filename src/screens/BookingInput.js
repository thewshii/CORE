import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AddressInputWithAutosuggestion from '../components/AddressInputWithAutosuggestion';

function BookingInput() {
  const [pickupLocation, setPickupLocation] = useState({});
  const [destinationLocation, setDestinationLocation] = useState({});

  const handleBooking = () => {
    console.log('Booking from:', pickupLocation.label, ' to:', destinationLocation.label);
  };

  return (
    <View style={styles.container}>
      <AddressInputWithAutosuggestion
        label="Pickup Location"
        onLocationSelect={location => {
          console.log('Pickup location selected:', location);
          setPickupLocation(location);
        }}
      />
      <AddressInputWithAutosuggestion
        label="Destination Location"
        onLocationSelect={location => {
          console.log('Destination location selected:', location);
          setDestinationLocation(location);
        }}
      />
      <Button title="Book" onPress={handleBooking} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});

export default BookingInput;