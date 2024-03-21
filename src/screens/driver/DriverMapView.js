import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import supabase from '../../supabase/supabaseClient';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import MapViewDirections from 'react-native-maps-directions';
import Constants from 'expo-constants';

function DriverMapView() {
  const navigation = useNavigation();
  const userID = useSelector(selectUser);
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [selectedRideRequest, setSelectedRideRequest] = useState(null);
  const GOOGLE_MAPS_APIKEY = Constants.expoConfig.extra.googleApiKey;
  const mapRef = useRef(null);

  useEffect(() => {
    const getDriverLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'You need to grant location permission to get the driver\'s location.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setDriverLocation(location.coords);
    };

    getDriverLocation();
  }, []);

  useEffect(() => {
    let subscription;
    if (isOnline) {
      subscription = supabase
        .channel('public-ride_bookings')
        .on('postgres_changes', { event: 'INSERT', schema: 'public' }, payload => {
          console.log('New ride request received.');
          setRideRequests(prev => [...prev, payload.new]);
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isOnline]);

  const acceptRide = async (rideId) => {
    const { error } = await supabase
      .from('ride_bookings')
      .update({ status: 'accepted', driver_id: userID })
      .eq('id', rideId);

    if (error) {
      console.error('Error updating ride status:', error.message);
      return;
    }

    const ride = rideRequests.find(request => request.id === rideId);
    setSelectedRideRequest(ride);
    setRideRequests(prevRequests => prevRequests.filter(request => request.id !== rideId));
  };

  const declineRide = (rideId) => {
    setRideRequests(prevRequests => prevRequests.filter(request => request.id !== rideId));
    if (selectedRideRequest && selectedRideRequest.id === rideId) {
      setSelectedRideRequest(null);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  

  const toggleOnlineStatus = async () => {
    setIsOnline(prev => !prev);
    await supabase
      .from('drivers')
      .update({ onlineStatus: isOnline ? 'true' : 'false' })
      .eq('uuid', userID);
  };

  return (
    <View style={tw`h-full`}>
      <MapView
        ref={mapRef}
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
      >
        {selectedRideRequest && driverLocation && (
          <MapViewDirections
            origin={driverLocation}
            destination={selectedRideRequest.pickupLocation} // Assuming this is a valid coordinate
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="black"
            onReady={result => {
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
            onError={(errorMessage) => {
              console.error('GMAPS route request error:', errorMessage);
              Alert.alert("Route Error", "An error occurred while trying to find a route.");
            }}
          />
        )}
        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
            title="Driver"
            description="You are here"
          />
        )}

        {rideRequests.map((request, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: request.pickupLocation.latitude, longitude: request.pickupLocation.longitude }}
            title="New Ride Request"
            description="This is where you need to go"
            pinColor="blue"
          />
        ))
        }
        

        {selectedRideRequest && (
          <Marker
            coordinate={{ latitude: selectedRideRequest.pickupLocation.latitude, longitude: selectedRideRequest.pickupLocation.longitude }}
            title="Pickup Location"
            description="This is where you need to go"
            pinColor="green"
          />
        )}

        {selectedRideRequest && (
          <Marker
            coordinate={{ latitude: selectedRideRequest.dropoffLocation.latitude, longitude: selectedRideRequest.dropoffLocation.longitude }}
            title="Dropoff Location"
            description="This is where you need to take the passenger"
            pinColor="red"
          />
        )}

        
      </MapView>

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
        style={[tw`absolute bottom-12 self-center w-24 h-24 rounded-full justify-center items-center`, { backgroundColor: isOnline ? 'red' : 'green' }]}>
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
                