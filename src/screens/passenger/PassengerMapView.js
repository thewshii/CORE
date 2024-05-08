import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import tw from 'tailwind-react-native-classnames';
import RideOptionsCard from '../../components/RideOptionsCard';
import NavCard from '../../components/NavCard';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { setOrigin, setDestination, selectDestination, selectOrigin, setTravelTimeInformation, setTravelInfo } from '../../slices/navSlice';
import ConfirmedCard from '../../components/ConfirmedCard';


const Stack = createStackNavigator();

const PassengerMapView = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const googleApiKey = Constants.expoConfig.extra.googleApiKey; // INPUT_REQUIRED {Ensure Google API Key is valid and has permissions for Directions API}

  // Graphhopper Fetch

 

  // Get permission and set initial region to a broad area
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      if (!origin) {
        // If there's no origin set, update the map's region to the user's current location
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 2500);
      }
    })();
  }, [origin]);

  useEffect(() => {
    if (origin && destination && mapRef.current) {
      // Animate to the pickup address
      mapRef.current.animateToRegion({
        latitude: origin.location.latitude,
        longitude: origin.location.longitude,
        latitudeDelta: 0.01, // Adjust these values as needed
        longitudeDelta: 0.01,
      }, 3500); // Duration of the animation in milliseconds
  
      // Wait for the animation to finish, then fit the route between origin and destination
      setTimeout(() => {
        mapRef.current.fitToCoordinates([
          {
            latitude: origin.location.latitude,
            longitude: origin.location.longitude,
          },
          {
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          },
        ], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 3500); // Wait for the same duration as the animation
    }
  }, [origin, destination]);

  useEffect(() => {
    const getTravelTime = async () => {
      if (origin && destination) {
        const URL = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin.description}&destinations=${destination.description}&key=${googleApiKey}`;
        try {
          const response = await fetch(URL);
          const data = await response.json();
          console.log('Travel time data:', data);
          if (data.status === 'OK') {
            const distance = data.rows[0].elements[0].distance;
            const duration = data.rows[0].elements[0].duration;
            dispatch(setTravelTimeInformation({ distance, duration }));
          }

        } catch (error) {
          console.error('Error fetching travel time:', error);
        }
      }
    };
    getTravelTime();
  }, [origin, destination]);

  const clearDirectionsAndInputs = () => {
    dispatch(setOrigin(null));
    dispatch(setDestination(null));
    // Reset the view to the initial broad area
    mapRef.current?.animateToRegion({
      latitude: 18.1322,
      longitude: -64.8116,
      latitudeDelta: 2,
      longitudeDelta: 2,
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableOpacity
        style={tw`absolute top-16 right-8 z-50 p-3 rounded-full`}
        onPress={clearDirectionsAndInputs}
      >
        <Icon name="delete" />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`absolute top-16 left-8 z-50 p-3 rounded-full`}
        onPress={() => navigation.navigate('RoleSelect')}
      >
        <Icon name="menu" />
      </TouchableOpacity>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={tw`h-full`}>
          <MapView

            ref={mapRef}
            style={tw`flex-1`}
            mapType="mutedStandard"
            provider='google'
            showsUserLocation={true}
               
            showsMyLocationButton={true}
            showsCompass={true}
            showsBuildings={true}
            initialRegion={{
              latitude: 18.1322, // Broad area initially shown
              longitude: -64.8116,
              latitudeDelta: 2,
              longitudeDelta: 2,
            }}
          >
            {origin?.description && destination?.description && (
              <MapViewDirections
              origin={origin.description}
              destination={destination.description}
              apikey={googleApiKey}
              strokeWidth={3}
              strokeColor="black"
              onReady={(result) => {
                if (result.distance && result.duration) { // Basic check to see if route data is present
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                } else {
                  // Handle "route not found" scenario gracefully
                  Alert.alert("Route Not Found", "Could not find a route between the selected origin and destination.");
                }
              }}
              onError={(errorMessage) => {
                // Handle API error or route not found errSor
                console.log('GMAPS route request error:', errorMessage);
                Alert.alert("Route Error", "An error occurred while trying to find a route.");
              }}
            />            
            )}
            {origin?.location && (
              <Marker
                coordinate={{latitude: origin.location.latitude, longitude: origin.location.longitude}}
                title="Origin"
              />
            )}
            {destination?.location && (
              <Marker
                coordinate={{latitude: destination.location.lat, longitude: destination.location.lng}}
                title="Destination"
              />
            )}
          </MapView>
          <View style={tw`h-1/2`}>
            <Stack.Navigator>
              <Stack.Screen name="NavCard" component={NavCard} options={{ headerShown: false }} />
              <Stack.Screen name="RideOptionsCard" component={RideOptionsCard} options={{ headerShown: false }} />
              <Stack.Screen name="ConfirmedCard" component={ConfirmedCard} options={{ headerShown: false }} />
            </Stack.Navigator>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
});

export default PassengerMapView;