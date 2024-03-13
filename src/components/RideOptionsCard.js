import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectTravelTimeInformation } from '../slices/navSlice';
import axios from 'axios';
import { ActivityIndicator } from 'react-native';
import { selectOrigin, selectDestination } from '../slices/navSlice';
import supabase from '../supabase/supabaseClient';

const GRAPH_HOPPER_API_KEY = '1f8e47e9-fcc5-4c26-8702-06e415fee0aa';

const data = [
  {
    id: "UBAH-X-123",
    title: "UBAH-eco",
    multiplier: 1,
    image: "https://links.papareact.com/3pn",
  },
  {
    id: "Uber-XL-456",
    title: "UBAH-xl",
    multiplier: 1.2,
    image: "https://links.papareact.com/5w8",
  },
  {
    id: "Uber-LUX-789",
    title: "UBAH-lux",
    multiplier: 1.75,
    image: "https://links.papareact.com/7pf",
  },
];


// Your calculateFare function
const calculateFare = (distance, multiplier) => {
  let baseFare;
  let perMileRate;
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 23) {
    baseFare = 10;
    perMileRate = 3;
  } else if (currentHour >= 23 || currentHour < 2) {
    baseFare = 15;
    perMileRate = 4;
  } else {
    baseFare = 20;
    perMileRate = 5;
  }

  const totalFare = (baseFare + (distance * perMileRate)) * multiplier;
  return totalFare.toFixed(2);
};

const RideOptionsCard = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const travelTimeInformation = useSelector(selectTravelTimeInformation);
  
  const distanceInMiles = travelTimeInformation?.distance?.value * 0.000621371;

  const confirmBooking = async () => {
    if (!selected || !origin || !destination) {
      console.error("Required information is missing");
      return;
    }
  
    const { data, error } = await supabase
      .from('ride_bookings')
      .insert([
        {
          pickupLocation: JSON.stringify(origin),
          dropoffLocation: JSON.stringify(destination),
          rideType: selected.title,
          fare: calculateFare(distanceInMiles, selected.multiplier),
          status: "new"
  
          // Add other necessary fields, e.g., user_id
        },
      ]);

  
    if (error) {
      console.error("Error confirming booking:", error);
    } else {
      console.log("Booking confirmed.");
      alert("Booking confirmed.");
      // Optionally, navigate to another screen or show a confirmation message
    }
  };
  

  useEffect(() => {
    const fetchTravelDistanceGraphHopper = async () => {
      if (!origin || !destination) {
        setError("Origin or destination is not defined");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`https://graphhopper.com/api/1/route`, {
          params: {
            point: [
              `${origin.location.latitude},${origin.location.longitude}`,
              `${destination.location.lat},${destination.location.lng}`
            ],
            vehicle: "car",
            key: GRAPH_HOPPER_API_KEY,
          },
        });
        
        const distance = response.data.paths[0].distance; // Distance in meters
        setTravelInfo({ distance: distance / 1000 }); // Convert to kilometers
        setError(null);
      } catch (error) {
        setError("Failed to fetch travel distance");
      } finally {
        setLoading(false);
      }
    };

    fetchTravelDistanceGraphHopper();
  }, [origin, destination])

  /*Fare calculation function using the fetched distance
  const calculateFare = (multiplier) => {
    if (!travelInfo) return "...";

    let baseFare, perMileRate;
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 23) {
      baseFare = 10;
      perMileRate = 3;
    } else if (currentHour >= 23 || currentHour < 2) {
      baseFare = 15;
      perMileRate = 4;
    } else {
      baseFare = 20;
      perMileRate = 5;
    }

    const distanceInMiles = travelInfo.distance * 0.000621371; // Convert distance from meters to miles
    const fare = (baseFare + distanceInMiles * perMileRate) * multiplier;
    return fare.toFixed(2);
  };*/


if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <SafeAreaView style={tw`bg-white flex-grow`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`absolute top-3 left-2 z-50 p-3 bg-gray-300 rounded-full`}>
        <Icon name="chevron-left" type="fontawesome" />
      </TouchableOpacity>

      <Text style={tw`text-center py-5 text-xl`}>
        {travelTimeInformation?.duration.text} - {travelTimeInformation?.distance.text} {selected?.title}
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const fare = calculateFare(distanceInMiles, item.multiplier);

          // Toggle selection on press
          const handlePress = () => {
            if (selected && item.id === selected.id) {
              setSelected(null); // Deselect if the same item is pressed again
            } else {
              setSelected(item); // Set selected to the new item if a different item is pressed
            }
          };

          return (
            <TouchableOpacity
              onPress={handlePress} // Updated onPress to handle toggling
              style={tw`flex-row justify-between items-center px-10 py-2 ${item.id === selected?.id ? "bg-gray-200" : ""}`}
            >
              <Image
                style={{ width: 100, height: 100, resizeMode: "contain" }}
                source={{ uri: item.image }}
              />
              <View style={tw`-ml-6`}>
                <Text style={tw`text-xl font-semibold`}>{item.title}</Text>
              </View>
              <Text style={tw`text-xl`}>${fare}</Text>
            </TouchableOpacity>
          );
        }}
      />



      <View style={tw`mt-auto border-t border-gray-200`}>

      <TouchableOpacity
        onPress={confirmBooking}
        style={tw`bg-green-900 py-3 m-3 ${!selected ? "bg-gray-300" : ""}`}
        disabled={!selected}
      >
        <Text style={tw`text-center text-white text-xl`}>Confirm</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RideOptionsCard;