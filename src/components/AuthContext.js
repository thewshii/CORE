import React, { createContext, useState, useEffect } from 'react';
import supabase from '../supabase/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const session = supabase.auth.getSession();
    
        setUser(session?.user ?? null);
        setLoading(false);
    
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        });
    
        return () => {
        authListener.subscription.unsubscribe();};
    }, []);
    
    const value = {
        user,
    };
    
    return (
        <AuthContext.Provider value={value}>
        {!loading && children}
        </AuthContext.Provider>
    );
    };

// Path: CORE/CORE/src/components/LoadingScreen.js
