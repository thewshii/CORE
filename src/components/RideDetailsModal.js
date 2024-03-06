import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import supabase from '../supabase/supabaseClient';

const RideDetailsModal = ({ visible, onClose, rideDetails }) => {
  const acceptRide = async () => {
    const { data, error } = await supabase
      .from('ride_bookings')
      .update({ status: 'accepted' })
      .eq('id', rideDetails.id);

    if (error) {
      console.error('Error accepting ride:', error.message, error.stack);
      return;
    }
    console.log('Ride accepted', data);
    onClose();
  };

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>New Ride Details</Text>
          <Text>Pickup Location: {rideDetails.pickupLocation}</Text>
          <Text>Dropoff Location: {rideDetails.dropoffLocation}</Text>
          <Text>Ride Type: {rideDetails.rideType}</Text>
          <Button title='Accept Ride' onPress={acceptRide} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default RideDetailsModal;