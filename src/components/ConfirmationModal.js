import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import debounce from 'lodash.debounce'; // Assuming lodash.debounce is installed
import * as Location from 'expo-location';

const HERE_API_KEY = 'RJRsDhpmchbCilcBOaNaAgrmB-Q5VBUqKVN8eWryiF0';
const apiUrl = `https://autocomplete.search.hereapi.com/v1/autocomplete?apiKey=${HERE_API_KEY}&in=countryCode:VIR&q=`;

function AddressInputWithAutosuggestion({ label, onLocationSelect, onFareCalculated }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Debounced fetchSuggestions
  const fetchSuggestions = debounce(async (text) => {
    if (text.length > 0) {
      try {
        const response = await axios.get(`${apiUrl}${text}`);
        setSuggestions(response.data.items);
      } catch (error) {
        console.error('HERE API error:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, 300); // Adjust debounce time as needed

  useEffect(() => {
    if (query) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Geocode the address and calculate the fare
  const handleLocationSelect = async (item) => {
    setQuery(item.title);
    setSuggestions([]);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    const location = await Location.geocodeAsync(item.title);
    if (location.length > 0) {
      const { latitude, longitude } = location[0];
      // Here you would calculate the fare based on the coordinates
      // This is a placeholder for the fare calculation logic
      const fare = calculateFare(latitude, longitude); // Implement this function based on your fare calculation logic
      onFareCalculated(fare);
      onLocationSelect({ label: item.title, position: { latitude, longitude } });
    }
  };

  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        placeholder={`Enter ${label.toLowerCase()}`}
        onChangeText={setQuery}
        value={query}
        style={styles.input}
      />
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleLocationSelect(item)}
            style={styles.suggestionItem}
          >
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AddressInputWithAutosuggestion;

// Placeholder for the fare calculation function
// Implement the logic based on your specific needs
function calculateFare(latitude, longitude) {
  // Example calculation (this should be replaced with actual logic)
  return 20; // Fixed fare for example purposes
}
