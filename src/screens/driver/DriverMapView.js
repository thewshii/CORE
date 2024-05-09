import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native'; // Alert import added
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import supabase from '../../supabase/supabaseClient';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../slices/userSlice';
import { setRideStatus, selectRideStatus, selectRideRequestId } from '../../slices/navSlice';



function DriverMapView() {
  const navigation = useNavigation();
  const userID = useSelector(selectUser);
  const mapRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [selectedRideRequest, setSelectedRideRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const GOOGLE_MAPS_APIKEY = Constants.expoConfig.extra.googleApiKey;

  const [driversWithin5Miles, setDriversWithin5Miles] = useState([]);
  const [driversWithin10Miles, setDriversWithin10Miles] = useState([]);
  const [driversWithin15Miles, setDriversWithin15Miles] = useState([]);
  const dispatch = useDispatch(); 
  const rideRequestId = useSelector(selectRideRequestId);
  const rideStatus = useSelector(selectRideStatus);
  const [page, setPage] = useState(1);

  

  
  useEffect(() => {
  if (rideRequestId) {
    const subscription = supabase
      .from(`ride_bookings:id=eq.${rideRequestId}`)
      .on('UPDATE', payload => {
        console.log('Ride status updated:', payload.new.status);
        dispatch(setRideStatus(payload.new.status));
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }
}, [rideRequestId]);



  const currentLocation = driverLocation ? driverLocation : { latitude: 18.1322, longitude: -64.8116 };
  const rideId = useSelector(selectRideRequestId);




  // calculate the distance between driver and rider 
  const calculateDistance = (currentLocation, rideRequests) => {
    const lat1 = currentLocation.latitude;
    const lon1 = currentLocation.longitude;
    const lat2 = rideRequests.pickupLatitude;
    const lon2 = rideRequests.pickupLongitude;

    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *

              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in metres
    return distance * 0.000621371; // in miles
  };




  useEffect(() => {
    // Code for periodic location updates
    const interval = setInterval(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setDriverLocation(location.coords);
      })();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (driverLocation) {
        supabase
          .from('drivers')
          .update({ location: driverLocation })
          .eq('uuid', userID);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [driverLocation]);

  useEffect(() => {
    
    const fetchRideRequests = async (pageNumber) => {
      setIsLoading(true);
      const { data: requests, error } = await supabase
        .from('ride_bookings')
        .select('*')
        .eq('status', 'new');

      if (error) {
        console.error('Error fetching ride requests:', error.message);
        return;
      }

      setRideRequests(requests);
      setSelectedRideRequest(requests[0]);
      setIsLoading(false);
    };

    (async () => {
      await fetchRideRequests();
    })();
  }, []);


  
  useEffect(() => {
    const fetchDriversWithinRadius = async (radius) => {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('uuid, currentlocation');
  
      if (error) {
        console.error('Error fetching drivers:', error.message);
        return;
      }
  
      // Filter drivers based on their distance to the current location
      const driversWithinRadius = drivers.filter(driver => {
        const distance = calculateDistance(currentLocation, driver.currentlocation);
        return distance <= radius && driver.onlineStatus;
      });
  
      switch (radius) {
        case 5:
          setDriversWithin5Miles(driversWithinRadius);
          break;
        case 10:
          setDriversWithin10Miles(driversWithinRadius);
          break;
        case 15:
          setDriversWithin15Miles(driversWithinRadius);
          break;
        default:
          break;
      }
    };
  
    if (isOnline) {
      fetchDriversWithinRadius(5);
      fetchDriversWithinRadius(10);
      fetchDriversWithinRadius(15);
    }
  }, [isOnline, driverLocation]);

  useEffect(() => {
    console.log('Online status:', isOnline);
    let subscription;
    if (isOnline) {
      subscription = supabase
        .channel('public-ride_bookings')
        .on('postgres_changes', { event: 'INSERT', schema: 'public' }, payload => {
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
    
    console.log('Ride ID:', rideId);
    // Find the ride request in the current state  
    // If the ride request is not found (i.e., it was cancelled), return early
    let currentride = rideRequests.find(request => request.id === rideId);

    setSelectedRideRequest(currentride);
    

    // Remove the ride request from the current driver's list
    setRideRequests(prevRequests => prevRequests.filter(request => request.id !== rideId));
  
    console.log('Ride status:', rideStatus);
  };

  useEffect(() => {
    console.log('Selected ride:', selectedRideRequest);
  }, [selectedRideRequest]);

  const declineRide = async (rideId) => {
    // Remove the ride request from the current driver's list
    const updatedRideRequests = rideRequests.filter(request => request.id !== rideId);
    setRideRequests(updatedRideRequests);
    
  };

  const handleArrive = async () => {
    Alert.alert('Arrived', 'You have arrived at the pickup location.');
    await supabase
      .from('ride_bookings')
      .update({ status: 'Arrived' })
      .eq('id', selectedRideRequest.id);

    dispatch(setRideStatus('arrived'));
  };

  const handleStartTrip = async () => {
    Alert.alert('Trip Started', 'You have started the trip.');
    await supabase
      .from('ride_bookings')
      .update({ status: 'Started' })
      .eq('id', selectedRideRequest.id);

    dispatch(setRideStatus('started'));
  };

  const handleEndTrip = async () => {
    Alert.alert('Trip Ended', 'You have ended the trip.');
    await supabase
      .from('ride_bookings')
      .update({ status: 'Ended' })
      .eq('id', selectedRideRequest.id);

    dispatch(setRideStatus('ended'));
  };

  const toggleOnlineStatus = async () => {
    const newOnlineStatus = !isOnline;
  
    setIsOnline(newOnlineStatus);
    await supabase
      .from('drivers')
      .update({ onlineStatus: newOnlineStatus ? 'true' : 'false' })
      .eq('uuid', userID);
  
    if (!newOnlineStatus) {
      setRideRequests([]);
      setSelectedRideRequest(null);
    }
  
    console.log('Online status:', newOnlineStatus);
  
    if (newOnlineStatus) {
      Alert.alert('ONLINE', 'You are now online and ready to accept ride requests.');
    } else {
      Alert.alert('OFFLINE','You are now offline and will not receive any ride requests.' );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={tw`h-full`}>
      {isOnline && (
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
          {driverLocation && (
            <Marker
              coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
              title="Driver"
              description="You are here"
              pinColor="green"
            />
          )}
        </MapView>
      )}

      {isOnline && (
        <View style={tw`m-5 rounded-lg absolute right-10 w-1/2`}>
          {isLoading ? (
            <ActivityIndicator size="large" color="black" style={tw`absolute top-1/2 left-1/2`} /> // Remove the isLoading condition from here
          ) : (
            <FlatList
              data={rideRequests.slice(0, 2)}
              onEndReached={() => setPage(prevPage => prevPage + 1)}
              onEndReachedThreshold={0.5} // Trigger the onEndReached callback this far from the end of the list
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={tw`bg-white p-2 m-2 rounded-lg shadow-lg`}>
                  <Text style={tw`text-xl font-semibold text-center`}>Ride Booking</Text>
                  <Text style={tw`text-lg font-semibold text-center`}>${item.fare}</Text>
                  <Text style={tw`text-sm font-bold text-center`}>TRIP ID: {item.id}</Text>
                  <Text style={tw`text-sm font-semibold text-center`}>FROM: {item.pickupDesc}</Text>
                  <Text style={tw`text-sm font-semibold text-center`}>TO: {item.dropoffDesc}</Text>
                  <Text style={tw`text-sm font-semibold text-center`}>PAX: {item.passengerName}</Text>

                  <TouchableOpacity
                    onPress={() => acceptRide(item.id)}
                    style={tw`bg-green-500 p-2 rounded-lg mt-2`}
                  >
                    <Text style={tw`text-white text-center font-semibold`}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
              windowSize={1}
            />
          )}
        </View>
      )}

      {isOnline && (
        <TouchableOpacity
          onPress={handleArrive}
          style={[tw`absolute bottom-12 left-4 w-28 h-10 bg-white rounded-md justify-center items-center shadow-lg`, { zIndex: 1000 }]}
        >
          <Text style={tw`text-black font-bold`}>Arrive</Text>
        </TouchableOpacity>
      )}

      {isOnline && (
        <TouchableOpacity
          onPress={handleStartTrip}
          style={[tw`absolute bottom-40 self-center w-28 h-10 bg-white rounded-md justify-center items-center shadow-lg`, { zIndex: 1000 }]}
        >
          <Text style={tw`text-black font-bold`}>Start Trip</Text>
        </TouchableOpacity>
      )}

      {isOnline && (
        <TouchableOpacity
          onPress={handleEndTrip}
          style={[tw`absolute bottom-12 right-4 w-28 h-10 bg-white rounded-md justify-center items-center shadow-lg`, { zIndex: 1000 }]}
        >
          <Text style={tw`text-black font-bold`}>End Trip</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={toggleOnlineStatus}
        style={[tw`absolute bottom-12 self-center w-24 h-24 rounded-full justify-center items-center`, { backgroundColor: isOnline ? 'red' : 'green', zIndex: 100 }]}
      >
        <Text style={tw`text-white text-center font-bold`}>{isOnline ? "Go Offline" : "Go Online"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGoBack}
        style={[tw`absolute top-12 left-4 bg-white py-1 px-5 rounded-full shadow-lg`]}
      >
        <Icon name="arrow-back" color="black" size={25} />
      </TouchableOpacity>

      <View style={[tw`justify-center items-center`]} pointerEvents="none">
        <Text style={tw`text-center text-white p-2 bg-black bg-opacity-50 rounded-lg top-40`}>
          {isOnline ? "You're Online" : "You're Offline"}
        </Text>
      </View>
    </View>
  );
}

export default DriverMapView;
