import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, Text, Dimensions, Pressable } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import supabase from '../../supabase/supabaseClient';
import { useDispatch } from 'react-redux';
import { fetchTravelInfo } from '../../slices/navSlice';
import Constants from 'expo-constants';
import MapViewDirections from 'react-native-maps-directions';
import { useSelector } from 'react-redux';
import { selectDestination, selectOrigin } from '../../slices/navSlice';
import { Icon } from 'react-native-elements';

async function updateDriverLocation(latitude, longitude) {
  const { user, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
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
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = React.useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 600000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      }, ({ coords: { latitude, longitude } }) => {
        console.log('Updating driver location with latitude:', latitude, 'and longitude:', longitude); // gpt_pilot_debugging_log
        updateDriverLocation(latitude, longitude);
      });
    })();
  }, []);

  const googleApiKey = Constants.expoConfig.extra.googleApiKey;
  return (
    <View style={tw`h-full`}>
      <MapView 
        ref={mapRef}
        style={{width: '100%', height: Dimensions.get('window').height - 10}} mapType='mutedStandard'
        provider='google'
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={true}
        showsBuildings={true}
        initialRegion={{
          latitude: 18.1322, // Broad area initially shown
          longitude: -64.8116,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
      />
      <Pressable onPress={() => console.warn('go')} 
      style={[tw`bg-green-900 shadow-lg`, {position: 'absolute', bottom: 45, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center'}]}>
      <Text style={[tw`text-white text-center`, {fontWeight: 'bold'}]}>Go</Text>
      </Pressable>

     <Pressable onPress={() => console.warn('Pressed')} 
      style={[tw`bg-white py-3 px-5 rounded-full shadow-lg`, {position: 'absolute', top: 45, left: 10}]}>
      <Icon name="menu" color="black" size={16} />
    </Pressable>
    
    <Pressable onPress={() => console.warn('go')} 
    style={[tw`bg-green-900 shadow-lg`, {position: 'absolute', bottom: 45, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center'}]}>
    <Text style={[tw`text-white text-center`, {fontWeight: 'bold'}]}>GO</Text>
    </Pressable>





      <MapViewDirections
        origin={origin}
        destination={destination}
        apikey={googleApiKey}
        strokeWidth={3}
        strokeColor="black"
        onReady={(result) => {
          if (result.distance && result.duration) {
            mapRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          } else {
            Alert.alert("Route Not Found", "Could not find a route between the selected origin and destination.");
          }
        }}
        onError={(errorMessage) => {
          console.log('GMAPS route request error:', errorMessage);
          Alert.alert("Route Error", "An error occurred while trying to find a route.");
        }}
        />
        <View style={[StyleSheet.absoluteFillObject, tw`justify-center items-center`]}>
          <Text style={tw`text-center text-white p-2 bg-black bg-opacity-50 rounded-lg`}>You're Offline</Text>
        </View>
    </View>
  );
}


export default DriverMapView;