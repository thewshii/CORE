import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import supabase from '../supabase/supabaseClient';
import { selectOrigin, selectDestination, selectTravelTimeInformation, setRideConfirmed, setRideRequestId } from '../slices/navSlice';
import ConfirmedCard from './ConfirmedCard';


const rideOptions = [
  { id: "UBAH-X-123", title: "UBAH-eco", multiplier: 1, image: "https://links.papareact.com/3pn" },
  { id: "Uber-XL-456", title: "UBAH-xl", multiplier: 1.2, image: "https://links.papareact.com/5w8" },
  { id: "Uber-LUX-789", title: "UBAH-lux", multiplier: 1.75, image: "https://links.papareact.com/7pf" },
];

const RideOptionsCard = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const travelTimeInformation = useSelector(selectTravelTimeInformation);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const distanceInMiles = travelTimeInformation?.distance?.value * 0.000621371;

  function calculateFare(distance, multiplier) {
    const hour = new Date().getHours();
    const baseFare = (hour >= 6 && hour < 23) ? 10 : (hour >= 23 || hour < 2) ? 15 : 20;
    const perMileRate = (hour >= 6 && hour < 23) ? 3 : (hour >= 23 || hour < 2) ? 4 : 5;
    return ((baseFare + (distance * perMileRate)) * multiplier).toFixed(2);
  }  

  useEffect(() => {
    const websocket = new WebSocket('ws://50.116.43.117:8080');
    websocket.onopen = () => console.log('WebSocket connected');
    websocket.onerror = (error) => console.error('WebSocket Error:', error);
    return () => websocket.close();
  }, []);

  const confirmBooking = async () => {
    if (!selected || !origin || !destination || !distanceInMiles) {
      console.error("Required information is missing");
      return;
    }

    const fare = calculateFare(distanceInMiles, selected.multiplier);
    const bookingDetails = {
      pickupLocation: JSON.stringify(origin),
      dropoffLocation: JSON.stringify(destination),
      rideType: selected.title,
      fare,
      status: "new",
    };

    const { data, error } = await supabase.from('ride_bookings').insert([bookingDetails]);

    if (error) {
      console.error("Error confirming booking:", error);
    } else {
      console.log("Booking confirmed.");
      alert("Booking confirmed.");
      setConfirmedBooking({
        // Assuming the first item is the ride request
        origin: origin,
        destination: destination,
        travelTime: travelTimeInformation?.duration.text,
        distance: travelTimeInformation?.distance.text,
        fare,
      });

      dispatch(setRideConfirmed(true));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={tw`bg-white flex-grow`}>
      {confirmedBooking ? (
        <ConfirmedCard
          id={confirmedBooking.id}
          origin={confirmedBooking.origin}
          destination={confirmedBooking.destination}
          travelTime={confirmedBooking.travelTime}
          distance={confirmedBooking.distance}
          fare={confirmedBooking.fare}
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`absolute top-3 left-2 z-50 p-3 bg-gray-300 rounded-full`}>
            <Icon name="chevron-left" type="fontawesome" />
          </TouchableOpacity>

          <Text style={tw`text-center py-5 text-xl`}>
            {travelTimeInformation?.duration.text} - {travelTimeInformation?.distance.text}
          </Text>

          <FlatList
            data={rideOptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const fare = calculateFare(distanceInMiles, item.multiplier);
              return (
                <TouchableOpacity
                  onPress={() => setSelected(item)}
                  style={tw`flex-row justify-between items-center px-10 py-2 ${item.id === selected?.id ? "bg-gray-200" : ""}`}
                >
                  <Image style={{ width: 100, height: 100, resizeMode: "contain" }} source={{ uri: item.image }} />
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
              disabled={!selected}
              style={tw`bg-green-900 py-3 m-3 ${!selected ? "bg-gray-300" : ""}`}
            >
              <Text style={tw`text-center text-white text-xl`}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default RideOptionsCard;
