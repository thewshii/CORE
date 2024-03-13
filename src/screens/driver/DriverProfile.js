import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import supabase from '../../supabase/supabaseClient';

function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching driver profile from Supabase');
      const user = supabase.auth.user();

      if (!user) {
        console.error('Failed to fetch user details'); // gpt_pilot_debugging_log
        return; // Ensuring we do not proceed if user details are missing
      }

      const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      if (error) {
        console.error('Error fetching profile:', error.message, error);
      } else {
        setProfile(profileData);
        console.log('Profile fetched successfully:', profileData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile ? (
        <>
          <Text>Name: {profile.name}</Text>
          <Text>Email: {profile.email}</Text>
        </>
      ) : (
        <Text>No profile data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
});

export default DriverProfile;