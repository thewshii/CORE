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
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination } from '../slices/navSlice';
import expoConstants from 'expo-constants';

const NavCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [step, setStep] = useState('pickup'); // Control the current step
  const [pickupLocation, setPickupLocation] = useState(''); // Store pickup location description
  const [destinationLocation, setDestinationLocation] = useState(''); // Store destination location description
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

    // Dispatch the location to your Redux store and advance the flow
    if (locationType === 'pickup') {
      dispatch(setOrigin(location));
      setPickupLocation(data.description);
      setStep('destination'); // Move to destination selection
    } else if (locationType === 'destination') {
      dispatch(setDestination(location));
      setDestinationLocation(data.description);
      // Navigate to the RideOptionsCard screen
      navigation.navigate('RideOptionsCard');
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
        key: googleApiKey,
        language: 'en',
        components: 'country:VI', // Restrict search to US Virgin Islands
      }}
      styles={autoCompleteStyles}
      enablePoweredByContainer={false}
      debounce={400}
      onFail={error => console.error(error)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust based on your header/navigation bar height
      >
          <Text style={styles.title}>Where can we take you today?</Text>
          {step !== 'pickup' && (
            <View style={styles.locationReview}>
              <Text style={styles.locationText}>Pickup: {pickupLocation}</Text>
              {destinationLocation && <Text style={styles.locationText}>Dropoff: {destinationLocation}</Text>}
            </View>
          )}
          <View style={styles.autocompleteContainer}>
            {step === 'pickup' && renderAutocomplete('Pickup Location', 'pickup')}
            {step === 'destination' && renderAutocomplete('Destination Location', 'destination')}
          </View>
          {step === 'destination' && (
            <TouchableOpacity
              onPress={() => setStep('pickup')}
              style={styles.backButton}
            >
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
    elevation: 1, // for android shadow
    shadowColor: '#000000', // for ios shadow
    shadowOffset: { width: 0, height: 5 }, // for ios shadow
    shadowOpacity: 0.1, // for ios shadow
    shadowRadius: 5, // for ios shadow
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
  inner: {
    padding: 20,
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
  locationReview: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: 'black',
  },
  // Add more styles as needed
});

export default NavCard;
