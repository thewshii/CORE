import React, { useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import { useSelector } from 'react-redux';
import { selectOrigin } from '../../slices/navSlice';

function DriverMapView() {
  const origin = useSelector(selectOrigin);
  
  return (

  <View style={tw`h-full`}>
   <View style={tw`h-1/2`}>
  <MapView
    style={tw`flex-1`}
    mapType='mutedStandard' // Added to show satellite ma
    initialRegion={{
      latitude: 17.7320, // Updated to Kingshill's latitude
      longitude: -64.7986, // Updated to Kingshill's longitude
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }}
  >
    <Marker
      coordinate={{
        latitude: 17.7320, // Updated to Kingshill's latitude
        longitude: -64.7986, // Updated to Kingshill's longitude
      }}
      title="Kingshill"
      description="A central location on St. Croix, US Virgin Islands"
    />
  </MapView>
</View>



    <View style={tw`h-1/2`}>
      
    </View>
    
  </View>

  );
  };

export default DriverMapView;
