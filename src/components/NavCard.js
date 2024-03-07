import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination } from '../slices/navSlice';
import expoConstants from 'expo-constants';


const NavCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [step, setStep] = useState('pickup'); // 'pickup', 'destination', 'rideOptions'
  const googleApiKey = expoConstants.expoConfig.extra.googleApiKey;

  const handleSetLocation = (data, details, locationType) => {
    if (!details) {
      Alert.alert('Error', `Failed to fetch ${locationType} details. Please try again.`);
      return;
    }

    const location = {
      description: data.description,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
    };

    if (locationType === 'pickup') {
      dispatch(setOrigin(location));
      setStep('destination'); // Move to next step after setting pickup
    } else if (locationType === 'destination') {
      dispatch(setDestination(location));
      setStep('rideOptions'); // Move to next step after setting destination
    }
  };

  const renderAutocomplete = (placeholder, locationType) => (
    <GooglePlacesAutocomplete
      placeholder={placeholder}
      onPress={(data, details = null) => {
        handleSetLocation(data, details, locationType);
      }}
      fetchDetails={true}
      query={{
        key: googleApiKey, // Direct API key use for demonstration; use env variables or secure storage in production
        language: 'en',
        components: 'country:VI', // Restrict search to US Virgin Islands
      }}
      styles={autoCompleteStyles}
      enablePoweredByContainer={false}
      minLength={2}
      onFail={error => console.error(error)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <View style={styles.inner}>
          <Text style={styles.title}>Where are you going?</Text>
          <View style={styles.autocompleteContainer}>
            {step === 'pickup' && renderAutocomplete('Pickup Location', 'pickup')}
            {step === 'destination' && renderAutocomplete('Destination Location', 'destination')}
            {step === 'rideOptions' && (
              // Placeholder for RideOptions component
              <Text style={{ alignSelf: 'center', marginTop: 20 }}>Select your ride options here.</Text>
              // You could use a component or function here to select ride options
            )}
          </View>
          {step !== 'rideOptions' && (
            <TouchableOpacity
              onPress={() => setStep('destination')} // This button can be repurposed based on your flow needs
              style={[styles.bookButton, styles.bookButtonDisabled]} // Conditionally style or disable this button based on your app logic
              disabled={true} // Disable this as per your flow condition
            >
              <Text style={styles.bookButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
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
    elevation: 1, // for android shadow
    shadowColor: '#000000', // for ios shadow
    shadowOffset: { width: 0, height: 5 }, // for ios shadow
    shadowOpacity: 0.1, // for ios shadow
    shadowRadius: 5, // for ios shadow
    marginTop: 10,
  },
  // Add more styles for other parts like separator, etc.
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  inner: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    paddingBottom: 10,
  },
  autocompleteContainer: {
    flex: 0, // Ensure the GooglePlacesAutocomplete doesn't expand to fill space
    zIndex: 1, // Make sure this is above the elements behind it
  },
  bookButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: 'grey',
  },
  bookButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NavCard;
