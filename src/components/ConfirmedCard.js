import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectOrigin, selectDestination, selectTravelTimeInformation, selectSelectedRideOption } from '../slices/navSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import supabase from '../supabase/supabaseClient';

// Assume 1 kilometer = 0.621371 miles
const kilometersToMiles = (kilometers) => kilometers * 0.621371;

const ConfirmedCard = ({ rideRequest }) => {
    const navigation = useNavigation();
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const travelTimeInformation = useSelector(selectTravelTimeInformation);
    const selectedRideOption = useSelector(selectSelectedRideOption);

    const handleCancel = async () => {
        if (!rideRequest || !rideRequest.id) {
            console.error('Ride request data is missing');
            return;
        }

        const { error } = await supabase
            .from('ride_requests')
            .update({ status: 'cancelled' })
            .eq('id', rideRequest.id);

        if (error) {
            console.error('Error updating ride request:', error);
        } else {
            console.log('Ride request cancelled successfully');
            navigation.navigate('RideOptionsCard');
        }
    };

    const travelTime = travelTimeInformation?.duration.text;
    const distanceInKm = travelTimeInformation?.distance.value / 1000;
    const distanceInMiles = kilometersToMiles(distanceInKm);
    const fare = calculateFare(distanceInMiles, selectedRideOption?.multiplier);

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
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Travel Time:</Text> {travelTime}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Distance:</Text> {`${distanceInMiles.toFixed(2)} miles`}</Text>
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
