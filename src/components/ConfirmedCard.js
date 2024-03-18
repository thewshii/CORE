import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectOrigin, selectDestination, selectTravelTimeInformation, setRideConfirmed, setRideRequestId, selectRideRequestId } from '../slices/navSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import supabase from '../supabase/supabaseClient';

const ConfirmedCard = () => {
    const navigation = useNavigation();
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const travelTimeInformation = useSelector(selectTravelTimeInformation);
    const rideRequestId = useSelector(selectRideRequestId);
    const dispatch = useDispatch();

    const handleCancel = async () => {
        if (!rideRequestId) {
            console.error('Ride request ID is missing');
            return;
        }

        const { error } = await supabase
            .from('ride_bookings')
            .update({ status: 'cancelled' })
            .eq('id', rideRequestId);

        if (error) {
            console.error('Error updating ride request:', error);
            Alert.alert("Error", "Failed to cancel the ride.");
        } else {
            console.log('Ride request cancelled successfully');
            Alert.alert("Success", "Ride has been cancelled.");
            dispatch(setRideConfirmed(false));
            dispatch(setRideRequestId(null));
            navigation.navigate('RideOptionsCard');
        }
    };

    const distanceInMiles = (travelTimeInformation?.distance?.value * 0.000621371).toFixed(2);
    const fare = calculateFare(distanceInMiles, 1); // Assuming multiplier is 1 for simplicity

    return (
        <SafeAreaView style={[tw`bg-white p-4 rounded-lg shadow-xl`, styles.card]}>
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

const styles = StyleSheet.create({
    card: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
});

export default ConfirmedCard;

function calculateFare(distance, multiplier) {
    const hour = new Date().getHours();
    const baseFare = hour >= 6 && hour < 23 ? 10 : hour >= 23 || hour < 2 ? 15 : 20;
    const perMileRate = hour >= 6 && hour < 23 ? 3 : hour >= 23 || hour < 2 ? 4 : 5;
    return ((baseFare + (distance * perMileRate)) * multiplier).toFixed(2);
}
