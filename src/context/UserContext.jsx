import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { supabase, useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState('Basic');

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const adminEmails = ['isaacbrainer4@gmail.com'];
      if (user && adminEmails.includes(user.email)) {
        setTier('Pro');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            tier: 'Basic',
            full_name: user.user_metadata?.full_name || 'Trader'
          }])
          .select()
          .single();
        
        if (newProfile) {
          setTier(newProfile.tier);
        }
      } else if (data) {
        setTier(data.tier);
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setTier('Basic');
    }
  }, [user, fetchProfile]);

  return (
    <UserContext.Provider value={{ tier, setTier, refreshProfile: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
