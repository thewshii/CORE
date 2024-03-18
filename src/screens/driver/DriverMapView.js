import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, Text, Dimensions, Pressable, TouchableOpacity, SafeAreaView } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '../../slices/userSlice';

function DriverMapView() {
  const dispatch = useDispatch();
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const navigation = useNavigation();
  const [rideRequest, setRideRequest] = useState(null);
  const ws = useRef(null);
  const userID = useSelector(selectUser);

  useEffect(() => {
    ws.current = new WebSocket('ws://50.116.43.117:8080');

    ws.current.onmessage = (e) => {
      const message = e.data;
      console.log('Received message:', message);

      try {
        const jsonMessage = JSON.parse(message);
        console.log('Parsed JSON message:', jsonMessage);

        if (jsonMessage.type === 'confirmed-booking') {
          setConfirmedBooking(jsonMessage.bookingDetails);
          console.log('Confirmed booking:', jsonMessage.bookingDetails);
        }
      } catch (error) {
        console.error('Error parsing JSON message:', error);
      }
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
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
      setRideRequest(null); // Clear the ride request after accepting
    }
  };

  const declineRide = () => {
    // Send message back to server indicating ride was declined
    ws.current.send(JSON.stringify({ type: 'ride-declined', rideId: rideRequest.id }));

    // Clear the ride request from the UI
    setRideRequest(null);
  };

  async function updateDriverLocation(latitude, longitude) {
    if (!userID) {
      console.error('User not authenticated');
      return;
    }

    console.log('User ID for location update:', userID, 'with latitude:', latitude, 'and longitude:', longitude);

    const { data: activeRide, error: fetchError } = await supabase
      .from('ride_bookings')
      .select()
      .eq('driver_id', userID)
      .eq('status', 'accepted') // assuming 'accepted' is the status for the ongoing rides the driver has accepted
      .single();
  
    if(fetchError){
      console.log('Error fetching active ride:', fetchError.message, fetchError.stack); // gpt_pilot_debugging_log
      return;
    }
  
    if (!activeRide) {
      console.log(`No active ride found for driver: ${userID}`); // gpt_pilot_debugging_log
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

  async function updateDriverStatus(online) {
    if (!userID) {
      console.error('User not authenticated');
      return false;
    }

    console.log('Updating driver status to:', online, 'for user:', userID);

  const { error } = await supabase
    .from('drivers')
    .update({ onlineStatus: online })
    .eq('uuid', userID);

  if (error) {
    console.error('Error updating driver status:', error.message);
    return false;
  }
  setIsOnline(online);  // Update the local state to reflect the new status
  return true;
}


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 60000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      }, ({ coords: { latitude, longitude } }) => {
        console.log('Updating driver location with latitude:', latitude, 'and longitude:', longitude); // gpt_pilot_debugging_log
        updateDriverLocation(latitude, longitude);
      });
    })();
  }, []);

  async function toggleOnlineStatus() {
    const success = await updateDriverStatus(!isOnline);
    if (success) {
      setIsOnline(!isOnline);
      Alert.alert("Status Update", isOnline ? "You are now offline." : "You are now online.");
    }
  }

  const handleGoBack = () => {
    navigation.goBack();
  };

  
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
      {rideRequest && (
                <View style={styles.rideRequestContainer}>
                    <Text>New Ride Request:</Text>
                    <Text>From: {rideRequest.origin.description}</Text>
                    <Text>To: {rideRequest.destination.description}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => acceptRide(rideRequest.id)}>
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={declineRide}>
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                    </View>
            )}

      <TouchableOpacity onPress={toggleOnlineStatus} 
        style={[tw`shadow-lg`, {
          position: 'absolute', 
          bottom: 45, 
          alignSelf: 'center', 
          width: 100, 
          height: 100, 
          borderRadius: 50, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: isOnline ? 'red' : 'green'  // Change color based on online status
        }]}>
        <Text style={[tw`text-white text-center`, {fontWeight: 'bold'}]}>{isOnline ? "Go Offline" : "Go Online"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoBack}
        style={[tw`bg-white py-1 px-5 rounded-full shadow-lg`, {position: 'absolute', top: 45, left: 10}]}>
        <Icon name="arrow-back" color="black" size={25} />
      </TouchableOpacity>




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
  top: 100, // Adjust based on your layout
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
}
});


export default DriverMapView;
