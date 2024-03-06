import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'; // Import TouchableOpacity from react-native
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useState } from 'react';  // Import useState from react

const data = [  // Define the data array
    {
        id: '123',
        title: 'Economy',
        multiplier: 1,
        image: require('../../assets/eco.webp'),
    },
    {
        id: '456',
        title: 'SUV',
        multiplier: 1.2,
        image: require('../../assets/suv.webp'),
    },
    {
        id: '789',
        title: 'Premium',
        multiplier: 1.75,
        image: require('../../assets/prem.webp'),
    },
];  // End of the data array definition


const RideOptionsCard = () => {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null);  // Define the selected state variable and the setSelected function
    return (
        <SafeAreaView style={tw`bg-white flex-grow`}>
            <View style={tw`flex-1`}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('navCard')}
                >

            </TouchableOpacity>
            <Text style={tw`text-center flex-grow text-xl`}>Select your ride type!</Text>
            </View>


            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item: { id, title, multiplier, image}, item }) => (
                    <TouchableOpacity
                        onPress={() => setSelected(item)}
                        style={tw`flex-row justify-between items-center px-10 ${item.id === selected?.id && 'bg-gray-200'}`}
                    >
                        <View style={tw`-ml-6`}>
                            <Text style={tw`text-xl font-semibold text-center`}>{item.title}</Text>
                        </View>
                    </TouchableOpacity>
                )}

            />

            <View style={tw`mt-auto border-t border-gray-200`}>
                <TouchableOpacity
                    disabled={!selected}
                    style={tw`bg-black py-3 m-3 ${!selected && 'bg-gray-300'}`}
                >
                    <Text style={tw`text-center text-white text-xl`}>
                        Choose {selected?.title}
                    </Text>
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
    );
}

export default RideOptionsCard;

const styles = StyleSheet.create({
    headerButton: {
        width: '100%',
        position: 'absolute',
        top: 3,
    },
});
