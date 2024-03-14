import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import supabase from '../../supabase/supabaseClient';

function PassengerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // Retrieve the current session
      const session = supabase.auth.getSession();

      if (session && session.user) {
        const userId = session.user.id;
        const { data, error } = await supabase
          .from('passengers')
          .select('*')
          .eq('id', userId) // Make sure 'id' matches the column in your table
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
        } else if (data) {
          setProfile(data);
        } else {
          console.error("No profile data found.", error.message);
        }
      } else {
        console.error("No active session found.");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Profile</Text>
      {profile ? (
        <>
          <Image
            source={{ uri: profile.avatar_url || 'https://placekitten.com/200/200' }}
            style={styles.avatar}
          />
          <Text style={styles.info}>Name: {profile.firstName}</Text>
          <Text style={styles.info}>Last Name: {profile.lastName}</Text>
          <Text style={styles.info}>Phone: {profile.phoneNumber}</Text>
          <Text style={styles.info}>Rating: {profile.rating}</Text>
          <Text style={styles.info}>Total Rides: {profile.totalRides}</Text>
        </>
      ) : (
        <Text>No profile data found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default PassengerProfile;
