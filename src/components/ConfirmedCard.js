import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectOrigin, selectDestination, selectTravelTimeInformation, setRideConfirmed, setRideRequestId, selectRideRequestId } from '../slices/navSlice';
import { Icon } from 'react-native-elements';
import supabase from '../supabase/supabaseClient';

const ConfirmedCard = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const travelTimeInformation = useSelector(selectTravelTimeInformation);
    const rideRequestId = useSelector(selectRideRequestId);

    const handleCancel = async () => {
        if (!rideRequestId) {
            Alert.alert("Error", "Ride request ID is missing");
            return;
        }

        const { error } = await supabase
            .from('ride_bookings')
            .update({ status: 'cancelled' })
            .eq('id', rideRequestId);

        if (error) {
            Alert.alert("Error", "Failed to cancel the ride. Please try again.", error.message);
        } else {
            navigation.goBack();
            Alert.alert("Ride Cancelled", "Your ride has been successfully cancelled, schedule another.");
            dispatch(setRideConfirmed(false));
            dispatch(setRideRequestId(null));
        }
    };

    const calculateFare = (distance, multiplier) => {
        const hour = new Date().getHours();
        const baseFare = hour >= 6 && hour < 23 ? 10 : 15;
        const perMileRate = hour >= 6 && hour < 23 ? 3 : 4;
        return ((baseFare + (distance * perMileRate)) * multiplier).toFixed(2);
    };

    const distanceInMiles = (travelTimeInformation?.distance?.value * 0.000621371).toFixed(2);
    const fare = calculateFare(distanceInMiles, 1); // Assuming multiplier is 1 for simplicity

    return (
        <SafeAreaView style={tw`bg-white p-4 rounded-lg shadow-xl`}>
            <TouchableOpacity
                style={tw`absolute top-3 left-5 p-3 rounded-full`}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" type="material" color="black" size={25} />
            </TouchableOpacity>
            <Text style={tw`text-xl text-center font-semibold`}>Confirmed - Pending Acceptance</Text>
            <View style={tw`mt-2`}>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Origin:</Text> {origin?.description}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Destination:</Text> {destination?.description}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Travel Time:</Text> {travelTimeInformation?.duration.text}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Distance:</Text> {distanceInMiles} miles</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Fare:</Text> ${fare}</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={tw`bg-black py-3 m-3 rounded-lg`}>
                <Text style={tw`text-center text-white font-semibold`}>Cancel</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ConfirmedCard;
