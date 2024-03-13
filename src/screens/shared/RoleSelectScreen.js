import React from 'react';
import { SafeAreaView, Image, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import NavOptions from '../../components/NavOptions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination } from '../../slices/navSlice';




const RoleSelectScreen = () => {
  const googleApiKey = Constants.expoConfig.extra.googleApi;
  const dispatch = useDispatch();
 


   return (
    <SafeAreaView style={tw`bg-white h-full`}>
      <Image
        style={tw`w-32 h-24`}
        source={require('../../../assets/splash.png')}
        />
      <Text style={tw`text-xl text-center font-semibold ml-5 mt-5`}>Apply to drive with us below!</Text>

      <NavOptions/>
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