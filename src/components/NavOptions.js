import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import tw from 'tailwind-react-native-classnames';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const data = [
    {
        id: 1,
        name: 'Go Driving!',
        image: require('../../assets/pax.png'),
        role: 'driver',
        screen: 'DriverDashboard',
    },      
    {
        id: 2,
        name: 'Catch a Ride!',
        image: require('../../assets/pax.png'),
        role: 'passenger', 
        screen: 'PassengerDashboard',
    }
]

const NavOptions = () => {
    const navigation = useNavigation();


    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({item}) => (
                <TouchableOpacity 
                onPress={() => navigation.navigate(item.screen)}
                style={tw`p-2 pl-6 pb-8 pt-4 m-2 w-40`}>
                    <View>
                        <Image
                            style={{width: 120, height: 120}}
                            source={item.image}
                        />
                        <Text style={tw`mt-2 text-lg font-semibold`}>{item.name}</Text>
                        <Icon
                            style={tw`p-2 bg-black rounded-full w-10 mt-4`}
                            name='arrowright'
                            color='white'
                            type='antdesign'   
                        />
        
                    </View>
                </TouchableOpacity>
            )}
        />
    
 
    )

}

export default NavOptions;

