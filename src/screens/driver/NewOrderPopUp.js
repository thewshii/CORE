import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setDestination, setTravelInfo, selectOrigin, selectDestination, selectTravelTimeInformation } from "../../slices/navSlice";

const NewOrderPopUp = ({ order }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const travelTimeInformation = useSelector(selectTravelTimeInformation);
    
    const handlePress = () => {
        dispatch(setDestination({
        location: {
            lat: order.lat,
            lng: order.lng
        },
        description: order.description
        }));
        navigation.navigate('PassengerMapView');
    }
    
    return (
        <View style={styles.container}>
        <View style={styles.innerContainer}>
            <Text style={styles.title}>New Order</Text>
            <Text style={styles.description}>{order.description}</Text>
            <Text style={styles.price}>${order.price}</Text>
            <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
    }