import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import supabase from '../supabase/supabaseClient';
import { selectOrigin, selectDestination, selectTravelTimeInformation, setRideConfirmed, setRideRequestId, setRideStatus } from '../slices/navSlice';
import ConfirmedCard from './ConfirmedCard';
import { selectUser } from '../slices/userSlice';

const rideOptions = [
  { id: "X-123", title: "ECO", multiplier: 1, image: "https://links.papareact.com/3pn" },
  { id: "XL-456", title: "XL", multiplier: 1.2, image: "https://links.papareact.com/5w8" },
  { id: "LUX-789", title: "LUXE", multiplier: 1.75, image: "https://links.papareact.com/7pf" },
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
    const websocket = useRef(null);
    const user = useSelector(selectUser);
    const [passengerName, setPassengerName] = useState(null);
    // need to create a reference to passengers table to retrieve the name of the passenger

const fetchPassengerName = async () => {
  try {
    const { data, error } = await supabase
      .from('passengers')
      .select('firstName')
      .eq('id', user)
      .single();

    console.log("Passenger name data:", data);

    let fname = null;
    
    if (error) {
      console.error("Error fetching passenger name:", error);
      return null;
    } else {
      fname = data?.firstName;
      console.log("Passenger name fetched successfully:", fname);
      setPassengerName(fname);
      console.log("Passenger name:", fname);
    } if (fname) {
      return fname;
    } else {
      return null;
    }



  } catch (error) {
    console.error("Error fetching passenger name:", error);
    return null;
  }
};

    useEffect(() => {
        websocket.current = new WebSocket('ws://50.116.43.117:8080');
        websocket.current.onopen = () => console.log('WebSocket connected');
        websocket.current.onerror = (error) => console.error('WebSocket Error:', error);
        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, []);

    const distanceInMiles = travelTimeInformation?.distance?.value * 0.000621371;

    function calculateFare(distance, multiplier) {
        const hour = new Date().getHours();
        const baseFare = (hour >= 6 && hour < 23) ? 10 : (hour >= 23 || hour < 2) ? 15 : 20;
        const perMileRate = (hour >= 6 && hour < 23) ? 3 : (hour >= 23 || hour < 2) ? 4 : 5;
        return ((baseFare + (distance * perMileRate)) * multiplier).toFixed(2);
    }  

    const confirmBooking = async () => {
      if (!selected || !origin || !destination || !distanceInMiles) {
        console.error("Required information is missing");
        return;
      }

      const passengerName = await fetchPassengerName();
      

      setLoading(true);
      const fare = calculateFare(distanceInMiles, selected.multiplier);
      const identifier = Math.floor(Math.random() * 10000000000000000);
      const bookingDetails = {
        pickupLocation: JSON.stringify(origin),
        dropoffLocation: JSON.stringify(destination),
        rideType: selected.title,
        fare,
        status: "new",
        identifier, 
        pickupLatitude: origin.location.latitude,
        pickupLongitude: origin.location.longitude,
        dropoffLatitude: destination.location.lat,
        dropoffLongitude: destination.location.lng,
        dropoffDesc: destination.description,
        pickupDesc: origin.description,
        passengerName: passengerName, 
      };
    
      
    
      const { error } = await supabase.from('ride_bookings').insert([bookingDetails]);
    
      if (error ) {
        console.error("Error confirming booking:", error);
        setLoading(false);
      } else {
        console.log("Booking confirmed.");
        alert("Booking confirmed.");
        dispatch(setRideConfirmed(true));
        dispatch(setRideRequestId(identifier));
    
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
          const rideData = {
            type: 'ride',
            data: bookingDetails
          };
          websocket.current.send(JSON.stringify(rideData));
        }
    
        setConfirmedBooking({
          origin: origin,
          destination: destination,
          travelTime: travelTimeInformation?.duration.text,
          distance: travelTimeInformation?.distance.text,
          fare,
          identifier,
          pickupLatitude: origin.location.latitude,
          pickupLongitude: origin.location.longitude,
          dropoffLatitude: destination.location.latitude,
          dropoffLongitude: destination.location.longitude,
          dropoffDesc: destination.description,
          pickupDesc: origin.description,
          rideType: selected.title,
          passengerName,
          status: "pending",
        });
    
        setLoading(false);
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
