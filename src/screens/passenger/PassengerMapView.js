import React from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import tw from 'tailwind-react-native-classnames';
import { createStackNavigator } from '@react-navigation/stack';
import RideOptionsCard from '../../components/RideOptionsCard';
import NavCard from '../../components/NavCard';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { useNavigation } from '@react-navigation/native';

const PassengerMapView = () => {
  const Stack = createStackNavigator();
  const navigation = useNavigation();
 
  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableOpacity
        style={tw`bg-gray-100 absolute top-16 left-8 z-50 p-3 rounded-full shadow-lg`}
        onPress={() => navigation.navigate('NavOptions')}
      >
      <Icon name="menu"/>
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={tw`h-full`}>
          <View style={tw`h-1/2`}>
            <MapView
              style={tw`flex-1`}
              mapType="mutedStandard"
              initialRegion={{
                latitude: 17.7320, // Kingshill's latitude
                longitude: -64.7986, // Kingshill's longitude
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: 17.7320,
                  longitude: -64.7986,
                }}
                title="Kingshill"
                description="A central location on St. Croix, US Virgin Islands"
              />
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
