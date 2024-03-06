import React from 'react';
import { SafeAreaView, Image, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import NavOptions from '../components/NavOptions';

const RoleSelectScreen = () => {

   return (
    <SafeAreaView style={tw`bg-white h-full`}>
      <Image
        style={tw`w-32 h-24`}
        source={require('../../assets/splash.png')}
      />
      <Text style={tw`text-2xl font-semibold ml-5 mt-5`}>Welcome to VI Ubah! </Text>
      <Text style={tw`text-lg text-gray-500 ml-5 mt-5`}>Choose whether you want to drive or ride.</Text>
      

      <NavOptions />
    </SafeAreaView>
  );
}


export default RoleSelectScreen;