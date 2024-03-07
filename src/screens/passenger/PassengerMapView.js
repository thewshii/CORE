import React from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import tw from 'tailwind-react-native-classnames';
import RideOptionsCard from '../../components/RideOptionsCard';
import NavCard from '../../components/NavCard';
import useMapLogic from '../../hooks/useMapLogic';

const PassengerMapView = () => {
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const { mapRef, origin, destination, googleApiKey } = useMapLogic(); // Use the custom hook

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
                latitude: 17.7320,
                longitude: -64.7986,
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
                    // Handle MapViewDirections error here
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
