import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import supabase from '../../supabase/supabaseClient';

function PassengerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data, error } = await supabase
        .from('passengers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      } else {
        setProfile(data);
        setLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Check for an active session on mount in case the listener doesn't trigger immediately
    const session = supabase.auth.getSession();
    if (session) {
      fetchProfile(session.user.id);
    } else {
      setLoading(false);
    }

    // Cleanup the listener when the component unmounts
    return () => {
      listener.unsubscribe();
    };
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
          <Text style={styles.info}>Name: {profile.first_name}</Text>
          <Text style={styles.info}>Last Name: {profile.last_name}</Text>
          <Text style={styles.info}>Phone: {profile.phone_number}</Text>
          <Text style={styles.info}>Rating: {profile.rating}</Text>
          <Text style={styles.info}>Total Rides: {profile.total_rides}</Text>
          {/* Add more profile details here */}
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
