import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import supabase from '../../supabase/supabaseClient';
import { useDispatch } from 'react-redux';
import { fetchTravelInfo } from '../../slices/navSlice';

async function updateDriverLocation(latitude, longitude) {
  const { user, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Failed to fetch user details', userError); // gpt_pilot_debugging_log
    return;
  }

  console.log('User ID for location update:', user.id); // gpt_pilot_debugging_log

  const { data: activeRide, error: fetchError } = await supabase
    .from('ride_bookings')
    .select()
    .eq('driver_id', user.id)
    .eq('status', 'accepted') // assuming 'accepted' is the status for the ongoing rides the driver has accepted
    .single();

  if(fetchError){
    console.error('Error fetching active ride:', fetchError.message, fetchError.stack); // gpt_pilot_debugging_log
    return;
  }

  if (!activeRide) {
    console.log(`No active ride found for driver: ${user.id}`); // gpt_pilot_debugging_log
    return;
  }

  const { error: updateError } = await supabase
    .from('ride_bookings')
    .update({ driver_lat: latitude, driver_lng: longitude })
    .eq('id', activeRide.id);

  if (updateError) {
    console.error('Error updating location:', updateError.message, updateError.stack); // gpt_pilot_debugging_log
  } else {
    console.log(`Driver location updated successfully for ride ${activeRide.id}`); // gpt_pilot_debugging_log
  }
}

function DriverMapView() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      }, ({ coords: { latitude, longitude } }) => {
        console.log('Updating driver location with latitude:', latitude, 'and longitude:', longitude); // gpt_pilot_debugging_log
        updateDriverLocation(latitude, longitude);
      });
    })();
  }, []);

  return (
    <View style={tw`h-full`}>
      <MapView style={tw`flex-1`} mapType='mutedStandard'/>
    </View>
  );
}

export default DriverMapView;