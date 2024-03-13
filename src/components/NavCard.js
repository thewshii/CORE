import React, { useState } from 'react';
import { KeyboardAvoidingView, SafeAreaView, Text, View, Platform, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Icon } from 'react-native-elements';
import tw from 'tailwind-react-native-classnames';
import { useDispatch, useSelector } from 'react-redux';
import { setOrigin, setDestination } from '../slices/navSlice';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import supabase from '/root/ubah-pilot/gpt-pilot/workspace/CORE/CORE/src/supabase/supabaseClient.js'

const NavCard = () => {
  const [destinationInputVisible, setDestinationInputVisible] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const googleApiKey = Constants.expoConfig.extra.googleApiKey; 
  

  const handleOriginSelect = (data, details = null) => {
    dispatch(setOrigin({
      description: data.description,
      location: {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      },
    }));
    setDestinationInputVisible(true);
  };

  const handleDestinationSelect = (data, details = null) => {
    dispatch(setDestination({
      description: data.description,
      location: details.geometry.location,
    }));
    navigation.navigate('RideOptionsCard'); // Ensure 'RideOptionsCard' is the correct name in your navigator setup
  };

  return (
    <SafeAreaView style={tw`bg-white flex-1`}>
      <Text style={tw`text-center py-5 text-xl`}>Leh we pick you up!</Text>
      <View style={tw`border-t border-gray-200 flex-shrink`}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1`}>
          <GooglePlacesAutocomplete
            placeholder='Pah you deh?'
            styles={toInputBoxStyles}
            fetchDetails={true}
            returnKeyType={'search'}
            enablePoweredByContainer={false}
            nearbyPlacesAPI='GooglePlacesSearch'
            onPress={handleOriginSelect}
            debounce={750}
            query={{
              key: googleApiKey,
              language: 'en',
              components: 'country:VI',
            }}
          />
          {destinationInputVisible && (
            <GooglePlacesAutocomplete
              placeholder='Pah you goin?'
              styles={toInputBoxStyles}
              fetchDetails={true}
              returnKeyType={'search'}
              minLength={2}
              enablePoweredByContainer={false}
              nearbyPlacesAPI='GooglePlacesSearch'
              onPress={handleDestinationSelect}
              debounce={750}
              query={{
                key: googleApiKey,
                language: 'en',
                components: 'country:VI',
              }}
            />
          )}
        </KeyboardAvoidingView>
      </View>
      <View style={tw`flex-row bg-white justify-evenly py-2 mt-auto border-t border-gray-100`}>
        <TouchableOpacity style={tw`flex-row justify-center bg-black w-24 px-4 py-3 rounded-full`} onPress={() => navigation.navigate('RoleSelect') }>
          <Icon name='home' type='material' color='green' size={16} />
          <Text style={tw`text-center text-white`}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row justify-center w-24 px-4 py-3 rounded-full`} onPress={() => navigation.navigate('RideOptionsCard') }>
          <Icon name='car' type='font-awesome' color='green' size={16} />
          <Text style={tw`text-center text-black`}>Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const toInputBoxStyles = {
  container: {
    backgroundColor: 'white',
    paddingTop: 20,
    flex: 0,
  },
  textInput: {
    backgroundColor: '#DDDDDF',
    borderRadius: 0,
    fontSize: 18,
  },
  textInputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  listView: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
};

export default NavCard;
