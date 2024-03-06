import React, { useState, useEffect } from 'react';
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
import { key } from '@env'; // Ensure your Google API key is correctly placed here
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination } from '../slices/navSlice';

const NavCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  // Validate Google API Key
  useEffect(() => {
    if (!key) {
      Alert.alert('API Key Error', 'Google API key is not configured correctly.');
    }
  }, []);

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
      setPickup(location);
    } else if (locationType === 'destination') {
      dispatch(setDestination(location));
      setDestination(location);
    }
  };

  const handleBook = () => {
    if (!pickup || !destination) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations.');
      return;
    }
    navigation.navigate('RideOptionsCard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Where are you going?</Text>
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder='Pickup Location'
              onPress={(data, details = null) => {
                handleSetLocation(data, details, 'pickup');
              }}
              fetchDetails={true}
              query={{
                key: key,
                language: 'en',
              }}
              styles={autoCompleteStyles}
              enablePoweredByContainer={false}
              minLength={2}
              // Add additional props for error handling if needed
            />
          </View>
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder='Destination Location'
              onPress={(data, details = null) => {
                handleSetLocation(data, details, 'destination');
              }}
              fetchDetails={true}
              query={{
                key: key,
                language: 'en',
              }}
              styles={autoCompleteStyles}
              enablePoweredByContainer={false}
              minLength={2}
              // Add additional props for error handling if needed
            />
          </View>
          <TouchableOpacity
            onPress={handleBook}
            style={[styles.bookButton, !(pickup && destination) && styles.bookButtonDisabled]}
            disabled={!(pickup && destination)}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
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
