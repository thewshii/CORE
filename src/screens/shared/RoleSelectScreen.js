import React, { useEffect } from 'react';
import { SafeAreaView, Image, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import NavOptions from '../../components/NavOptions';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import supabase from '../../supabase/supabaseClient';
import { setUser } from '../../slices/userSlice.js';

const RoleSelectScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      const response = await supabase.auth.getUser();
      const user = response.data?.user;
    
      console.log('User:', user);
      if (user) {
        dispatch(setUser(user.id)); // Dispatching only user ID to Redux store
        console.log('User ID:', user.id);
      } else {
        Alert.alert("Not Logged In", "Please log in to continue.");
        navigation.navigate('Login'); // Redirect to login screen if no user found
      }
    };
    

    checkUser();
  }, [dispatch, navigation]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      dispatch(setUser(null)); // Clear user data in Redux store on logout
      navigation.navigate('Login'); // Navigate to login screen after logout
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
};

export default RoleSelectScreen;
