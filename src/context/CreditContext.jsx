import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './AuthContext';
import { useAuth } from './AuthContext';

const CreditContext = createContext();

export const CreditProvider = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(50);
  const [tier, setTier] = useState('Basic');

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      const saved = localStorage.getItem('fx_credits');
      setCredits(saved !== null ? parseInt(saved) : 50);
      setTier('Basic');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, tier')
        .eq('id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist — self-heal by creating it (DB trigger may have missed it)
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            credits: 50, 
            tier: 'Basic',
            full_name: user.user_metadata?.full_name || 'Trader'
          }])
          .select()
          .single();
        
        if (newProfile) {
          setCredits(newProfile.credits);
          setTier(newProfile.tier);
        }
      } else if (data) {
        setCredits(data.credits);
        setTier(data.tier);
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
    }
  };

  const useCredits = async (amount, toolId = 'unknown') => {
    if (user) {
      const { data, error } = await supabase.rpc('deduct_credits', { p_amount: amount, p_tool_id: toolId });
      if (error) {
        console.error('Deduction failed:', error.message);
        alert(`Insufficient credits. You need ${amount} credits for this tool.`);
        return false;
      }
      setCredits(data);
      return true;
    } else {
      if (credits >= amount) {
        const newCredits = credits - amount;
        setCredits(newCredits);
        localStorage.setItem('fx_credits', newCredits);
        return true;
      }
      return false;
    }
  };

  const addCredits = (amount) => {
    setCredits(prev => prev + amount);
  };

  return (
    <CreditContext.Provider value={{ credits, tier, setTier, useCredits, addCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = () => useContext(CreditContext);
