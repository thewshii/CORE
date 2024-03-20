import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import supabase from '../../supabase/supabaseClient';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

function DriverMapView() {
  const navigation = useNavigation();
  const userID = useSelector(selectUser);
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);

  useEffect(() => {
    const subscription = supabase
      .channel('public-ride_bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public' }, payload => {
        console.log('New ride request:', payload.new);
        // Filter the requests to only show those relevant to this driver if necessary
        // For example, if you have a logic to assign requests to specific drivers
        setRideRequests(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const acceptRide = async (rideId) => {
    const { error } = await supabase
      .from('ride_bookings')
      .update({ status: 'accepted' })
      .eq('id', rideId);

    if (error) {
      console.error('Error updating ride status:', error.message);
    } else {
      // Optionally filter out the accepted request from local state
      setRideRequests(prevRequests => prevRequests.filter(request => request.id !== rideId));
      Alert.alert('Ride Accepted', 'You have accepted the ride.');
    }
  };

  const declineRide = (rideId) => {
    setRideRequests(prevRequests => prevRequests.filter(request => request.id !== rideId));
    Alert.alert('Ride Declined', 'You have declined the ride.');

  };

  async function toggleOnlineStatus() {
    setIsOnline(!isOnline);
    // Here you would also update the driver's status in your database
  }

  const handleGoBack = () => navigation.goBack();

  return (
    <View style={tw`h-full`}>
      <MapView
        ref={mapRef => mapRef}
        style={tw`w-full h-full`}
        provider="google"
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: 18.1322,
          longitude: -64.8116,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
      />

      {rideRequests.map((request, index) => (
        <View key={index} style={styles.rideRequestContainer}>
          <Text>New Ride Request:</Text>
          <Text>From: {request.pickupLocation}</Text>
          <Text>To: {request.dropoffLocation}</Text>
          <TouchableOpacity style={styles.button} onPress={() => acceptRide(request.id)}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => declineRide(request.id)}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={toggleOnlineStatus}
        style={[tw`absolute bottom-12 self-center w-24 h-24 rounded-full justify-center items-center`,
          { backgroundColor: isOnline ? 'red' : 'green' }]}>
        <Text style={tw`text-white text-center font-bold`}>{isOnline ? "Go Offline" : "Go Online"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGoBack}
        style={[tw`absolute top-12 left-4 bg-white py-1 px-5 rounded-full shadow-lg`]}>
        <Icon name="arrow-back" color="black" size={25} />
      </TouchableOpacity>

      <View style={[StyleSheet.absoluteFillObject, tw`justify-center items-center`]} pointerEvents="none">
        <Text style={tw`text-center text-white p-2 bg-black bg-opacity-50 rounded-lg`}>
          {isOnline ? "You're Online" : "You're Offline"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rideRequestContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    zIndex: 100,
  },
  button: {
    backgroundColor: 'blue',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default DriverMapView;
