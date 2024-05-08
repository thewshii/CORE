import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert, View, Button } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectOrigin, selectDestination, selectTravelTimeInformation, setRideConfirmed, setRideRequestId, setRideStatus, selectRideStatus, selectRideRequestId, setDestination,setOrigin} from '../slices/navSlice';
import { Icon } from 'react-native-elements';
import supabase from '../supabase/supabaseClient';

const ConfirmedCard = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const travelTimeInformation = useSelector(selectTravelTimeInformation);
    const rideRequestId = useSelector(selectRideRequestId);
    const ridesta = useSelector(selectRideStatus);
 

    const resetConfirmedCardData = () => {
        setRideRequestId(prevRequests => prevRequests.filter(request => request.id !== rideId));
        dispatch(setDestination(null));
        dispatch(setRideConfirmed(false));
        navigation.navigate('NavCard');
        

      };


    useEffect(() => {
        if (rideRequestId) {
            console.log('Subscribing to ride request:', rideRequestId);

            const subscription = supabase
                .channel(`ride_bookings`)
                .on('UPDATE', payload => {
                    console.log('Received update:', payload);
                    console.log('Ride status updated:', payload.new.status);
                    dispatch(setRideStatus(payload.new.status));
                })
                .subscribe();

            return () => {
                console.log('Unsubscribing from ride request:', rideRequestId);
                supabase.removeChannel(subscription);
            };
        } else {
            console.log('No ride request ID');
        }
    }, [rideRequestId, dispatch]);

    const handleCancel = async () => {
        try {
            const { error } = await supabase
                .from('ride_bookings')
                .update({ status: 'cancelled' })
                .eq('identifier', rideRequestId);

            if (error) {
                console.error('Error cancelling ride:', error.message);
                Alert.alert('Error', 'An error occurred while cancelling the ride. Please try again.');
            } else {
                dispatch(setRideConfirmed(false));
                dispatch(setRideRequestId(null));
                navigation.goBack();
                Alert.alert('Ride Cancelled', 'Your ride has been cancelled.');
                setRideRequestId(prevRequests => prevRequests.filter(request => request.id !== rideId));
            }
        } catch (error) {
            console.error('Error cancelling ride:', error.message);
            Alert.alert('Error', 'An error occurred while cancelling the ride. Please try again.');
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

    const [rideStatus, setRideStatus] = useState(ridesta);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchRideStatus();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const fetchRideStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('ride_bookings')
                .select('status')
                .eq('identifier', rideRequestId)
                .single();

            if (error) {
                console.error('Error fetching ride status:', error.message);
                return;
            }

            if (data) {
                setRideStatus(data.status);
            }
        } catch (error) {
            console.error('Error fetching ride status:', error.message);
        }
    };

    return (
        <SafeAreaView style={tw`bg-white p-4 rounded-lg shadow-xl`}>
            <TouchableOpacity
                style={tw`absolute top-3 left-5 p-3 rounded-full`}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" type="material" color="black" size={25} />
            </TouchableOpacity>
            <Text style={tw`text-xl text-center font-semibold`}>Ride Status: {rideStatus}</Text>
            <View style={tw`mt-2`}>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Origin:</Text> {origin?.description}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Destination:</Text> {destination?.description}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Travel Time:</Text> {travelTimeInformation?.duration.text}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Distance:</Text> {distanceInMiles} miles</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Fare:</Text> ${fare}</Text>
                <Text style={tw`text-sm`}><Text style={tw`font-semibold`}>Ride ID:</Text> {rideRequestId}</Text>
            </View>
            {rideStatus === 'Pending' && (
                <TouchableOpacity onPress={handleCancel} style={tw`bg-black py-3 m-3 rounded-lg`}>
                    <Text style={tw`text-center text-white font-semibold`}>Cancel Ride</Text>
                </TouchableOpacity>
            )}
            {rideStatus === 'new' && (
                <><Text style={tw`text-center py-3 m-3 text-sm`}>
                    Your ride request has been received. Please wait for a driver to accept the ride.
                </Text><TouchableOpacity onPress={handleCancel} style={tw`bg-black py-3 m-3 rounded-lg`}>
                        <Text style={tw`text-center text-white font-semibold`}>Cancel Ride</Text>
                    </TouchableOpacity></>
            )}
            {rideStatus === 'accepted' && (
                <Text style={tw`text-center py-3 m-3 text-sm`}>
                    Your ride has been accepted. The driver is on the way!
                </Text>
            )}
            {rideStatus === 'Arrived' && (
                <Text style={tw`text-center py-3 m-3 text-sm`}>
                    Your driver has arrived. Please meet your driver at the pickup location.
                </Text>
            )}
            {rideStatus === 'Cancelled' && (
                <View style={tw`text-center py-3 m-3`}>
                    <Text style={tw`text-sm`}>
                        Your ride has been cancelled.
                    </Text>
                    <TouchableOpacity style={tw`bg-black text-center rounded-lg py-3 m-3`} onPress={resetConfirmedCardData}>
                        <Text style={tw`text-white  font-bold`}>Book Again</Text>
                    </TouchableOpacity>
                </View>
            )}
            {rideStatus === 'Ended' && (
                <View style={tw`text-center py-3 m-3`}>
                    <Text style={tw`text-sm text-center`}>
                        Your ride is completed. Thank you for using our service!
                    </Text>
                    <TouchableOpacity style={tw`bg-black rounded-lg py-3 m-3`} onPress={resetConfirmedCardData}>
                        <Text style={tw`text-white text-center font-bold`}>Book Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ConfirmedCard;
