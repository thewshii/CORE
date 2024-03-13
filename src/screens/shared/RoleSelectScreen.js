import React from 'react';
import { SafeAreaView, Image, Text, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import NavOptions from '../../components/NavOptions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination } from '../../slices/navSlice';
import { useNavigation } from '@react-navigation/native';
import supabase from '../../supabase/supabaseClient';


const RoleSelectScreen = () => {
  const googleApiKey = Constants.expoConfig.extra.googleApi;
  const dispatch = useDispatch();
  const navigation = useNavigation();

 
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      // Navigate to login screen or another appropriate screen after logout
      navigation.navigate('Login'); // Replace 'Login' with the name of your login screen
    }
  };


   return (
    <SafeAreaView style={tw`bg-white h-full`}>
      <Image
        style={tw`w-32 h-24`}
        source={require('../../../assets/splash.png')}
        />
      <Text style={tw`text-xl text-center font-semibold ml-5 mt-5`}>Apply to drive with us below!</Text>

      <NavOptions/>
      <TouchableOpacity style={tw`bg-gray-200 mt-5 mx-5 p-3 rounded-lg`}>
        <Text style={tw`text-center font-semibold`}>Apply To Drive</Text>
      </TouchableOpacity>

      <TouchableOpacity 
      onPress={handleLogout}
      style={tw`bg-gray-200 mt-5 mx-5 p-3 rounded-lg`}>
        <Text style={tw`text-center font-semibold`}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const toInputBoxStyles = {
  container: {
      backgroundColor: 'white',
      paddingTop: 20,
      flex: 0,
  },
  textInput: {
      backgroundColor: '#DDDDDF',
      borderRadius: 0,
      fontSize: 18,
  },
  textInputContainer: {
      paddingHorizontal: 20,
      paddingBottom: 0,
  },
}

export default RoleSelectScreen;