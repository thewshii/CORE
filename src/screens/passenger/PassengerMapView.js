import React, { useEffect, useRef } from 'react'; // Import useRef directly
import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import tw from 'tailwind-react-native-classnames';
import RideOptionsCard from '../../components/RideOptionsCard';
import NavCard from '../../components/NavCard';
import useMapLogic from '../../hooks/useMapLogic'; // Assuming useMapLogic is correctly imported

const PassengerMapView = () => {
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const mapRef = useRef(null); // Use the useRef hook directly
  const { origin, destination, googleApiKey } = useMapLogic(); // Destructuring from useMapLogic
  
  useEffect(() => {
    if (!mapRef.current) return;
  
    // If both origin and destination are selected, fit the map to include both markers
    if (origin && destination) {
      // Create an array of marker coordinates
      const markers = [
        { latitude: origin.location.lat, longitude: origin.location.lng },
        { latitude: destination.location.lat, longitude: destination.location.lng },
      ];
  
      // Use Google Maps fitToCoordinates to include all markers in the view
      mapRef.current.fitToCoordinates(markers, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true, // Enable animation
      });
    } else if (origin) {
      // If only origin is selected, animate the map to center on the origin
      mapRef.current.animateToRegion({
        latitude: origin.location.lat,
        longitude: origin.location.lng,
        latitudeDelta: 0.005, // Adjust the zoom level
        longitudeDelta: 0.005,
      }, 1000); // Animation duration in milliseconds
    }
  }, [origin, destination]); // Dependency array includes both origin and destination  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableOpacity
        style={tw`bg-gray-100 absolute top-16 left-8 z-50 p-3 rounded-full shadow-lg`}
        onPress={() => navigation.navigate('RoleSelect')}
      >
        <Icon name="menu" />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={tw`h-full`}>
          <View style={tw`h-1/2`}>
            <MapView
              ref={mapRef}
              style={tw`flex-1`}
              mapType="mutedStandard"
              initialRegion={{
                // Use optional chaining (?.) to safely access nested properties
                latitude: origin?.location?.lat || 18.3358, // Provide fallback coordinates
                longitude: origin?.location?.lng || -64.8963,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {origin && destination && (
                <MapViewDirections
                  origin={origin.description}
                  destination={destination.description}
                  apikey={googleApiKey}
                  strokeWidth={3}
                  strokeColor="orange"
                  onError={(errorMessage) => {
                    console.error('MapViewDirections error:', errorMessage);
                  }}
                />
              )}
              {origin?.location && (
                <Marker
                  coordinate={{
                    latitude: origin.location.lat,
                    longitude: origin.location.lng,
                  }}
                  title="Origin"
                  description={origin.description}
                  identifier="origin"
                />
              )}
              {destination?.location && (
                <Marker
                  coordinate={{
                    latitude: destination.location.lat,
                    longitude: destination.location.lng,
                  }}
                  title="Destination"
                  description={destination.description}
                  identifier="destination"
                />
              )}
            </MapView>
          </View>

          <View style={tw`h-1/2`}>
            <Stack.Navigator>
              <Stack.Screen name="NavCard" component={NavCard} options={{ headerShown: false }} />
              <Stack.Screen name="RideOptionsCard" component={RideOptionsCard} options={{ headerShown: false }} />
            </Stack.Navigator>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PassengerMapView;
