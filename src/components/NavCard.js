import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setOrigin, setDestination } from '../slices/navSlice';
import expoConstants from 'expo-constants';
import * as Location from 'expo-location';

const NavCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const googleApiKey = expoConstants.expoConfig.extra.googleApiKey;
  const origin = useSelector((state) => state.nav.origin);
  const destination = useSelector((state) => state.nav.destination);
  const [step, setStep] = useState(origin ? 'destination' : 'pickup');

  const handleSetLocation = (data, details, locationType) => {
    if (!details) {
      Alert.alert('Error', `Failed to fetch ${locationType} details. Please try again.`);
      return;
    }

    const location = {
      description: data.description,
      location: {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      },
    };

    if (locationType === 'pickup') {
      dispatch(setOrigin(location));
      setStep('destination');
    } else {
      dispatch(setDestination(location));
      navigation.navigate('RideOptionsCard');
    }
  };

  const handleCurrentLocationPress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const response = await Location.reverseGeocodeAsync({ latitude, longitude });
    const address = response[0] || {};

    const locationData = {
      description: `Current Location: ${address.street}, ${address.city}`,
      location: { lat: latitude, lng: longitude },
    };

    if (step === 'pickup') {
      dispatch(setOrigin(locationData));
      setStep('destination');
    } else {
      dispatch(setDestination(locationData));
      navigation.navigate('RideOptionsCard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <Text style={styles.title}>Where can we take you today?</Text>
        <TouchableOpacity onPress={handleCurrentLocationPress} style={styles.currentLocationButton}>
          <Text style={styles.currentLocationButtonText}>Use Current Location</Text>
        </TouchableOpacity>
        <View style={styles.autocompleteContainer}>
          {step === 'pickup' && (
            <GooglePlacesAutocomplete
              placeholder='Pickup Location'
              onPress={(data, details = null) => handleSetLocation(data, details, 'pickup')}
              fetchDetails={true}
              query={{
                key: googleApiKey,
                language: 'en',
              }}
              styles={autoCompleteStyles}
              enablePoweredByContainer={false}
              debounce={400}
            />
          )}
          {step === 'destination' && (
            <GooglePlacesAutocomplete
              placeholder='Destination Location'
              onPress={(data, details = null) => handleSetLocation(data, details, 'destination')}
              fetchDetails={true}
              query={{
                key: googleApiKey,
                language: 'en',
              }}
              styles={autoCompleteStyles}
              enablePoweredByContainer={false}
              debounce={400}
            />
          )}
        </View>
        {step === 'destination' && (
          <TouchableOpacity
            onPress={() => setStep('pickup')}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const autoCompleteStyles = {
  container: {
    flex: 0,
    paddingTop: 20,
    paddingBottom: 10,
  },
  textInput: {
    height: 55,
    marginVertical: 5,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  listView: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 10,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    paddingBottom: 10,
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  currentLocationButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  currentLocationButtonText: {
    fontSize: 16,
    color: 'black',
  },
});

export default NavCard;
