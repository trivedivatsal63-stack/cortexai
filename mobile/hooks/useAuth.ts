import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        const mockUser: User = {
          id: 'user_1',
          name: 'Student',
          email: 'student@CortexAI.app',
          plan: 'free',
        };
        setUser(mockUser);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (e) {
      console.log('Auth load error:', e);
    }
    setIsLoaded(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const upgradeToPro = async () => {
    if (!user) return;
    const updated = { ...user, plan: 'pro' as const };
    setUser(updated);
    await AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  return { user, isLoaded, signOut, upgradeToPro, isPro: user?.plan === 'pro' };
}
