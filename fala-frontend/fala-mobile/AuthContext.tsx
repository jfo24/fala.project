import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure WebBrowser for better UX
WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// OAuth configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // You'll need to replace this
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'fala-mobile',
  path: 'auth',
});
const GOOGLE_SCOPES = ['openid', 'profile', 'email'];

// Facebook OAuth configuration
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // You'll need to replace this
const FACEBOOK_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'fala-mobile',
  path: 'facebook-auth',
});
const FACEBOOK_SCOPES = ['public_profile', 'email'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (you can implement AsyncStorage here)
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is already logged in from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('=== RESTORING USER FROM STORAGE ===');
        console.log('Restored user ID:', userData.id);
        console.log('=== END RESTORING USER ===');
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      // For demo purposes, we'll simulate a successful login
      // In production, you would implement proper Google OAuth
      setTimeout(async () => {
        try {
          // Check if user already exists in storage
          const storedUser = await AsyncStorage.getItem('user');
          let userData;
          
          if (storedUser) {
            // Use existing user data
            userData = JSON.parse(storedUser);
            console.log('=== USING EXISTING USER ===');
            console.log('Existing user ID:', userData.id);
            console.log('=== END USING EXISTING USER ===');
          } else {
            // Generate unique ID for new user
            const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            userData = {
              id: uniqueId,
              name: 'Demo User',
              email: 'demo@example.com',
              picture: 'https://via.placeholder.com/150',
            };
            console.log('=== CREATING NEW USER ===');
            console.log('New user ID:', userData.id);
            console.log('=== END CREATING NEW USER ===');
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
          
          setUser(userData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error during login:', error);
          setIsLoading(false);
        }
      }, 1500);

      // Uncomment and configure this for real Google OAuth:
      /*
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: GOOGLE_SCOPES,
        redirectUri: GOOGLE_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.authentication?.accessToken) {
        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${result.authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        setUser({
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        });
      }
      */
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setIsLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setIsLoading(true);

      // Check if Facebook App ID is configured
      if (FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID') {
        console.log('Facebook App ID not configured, using demo mode');
        
        // Demo mode fallback
        setTimeout(async () => {
          try {
            const storedUser = await AsyncStorage.getItem('user');
            let userData;
            
            if (storedUser) {
              userData = JSON.parse(storedUser);
              console.log('=== USING EXISTING USER (Facebook Demo) ===');
              console.log('Existing user ID:', userData.id);
            } else {
              const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              userData = {
                id: uniqueId,
                name: 'Facebook User (Demo)',
                email: 'facebook@example.com',
                picture: 'https://via.placeholder.com/150',
              };
              console.log('=== CREATING NEW USER (Facebook Demo) ===');
              console.log('New user ID:', userData.id);
              
              await AsyncStorage.setItem('user', JSON.stringify(userData));
            }
            
            setUser(userData);
            setIsLoading(false);
          } catch (error) {
            console.error('Error during Facebook demo login:', error);
            setIsLoading(false);
          }
        }, 1500);
        return;
      }

      // Real Facebook OAuth using expo-auth-session
      const request = new AuthSession.AuthRequest({
        clientId: FACEBOOK_APP_ID,
        scopes: FACEBOOK_SCOPES,
        redirectUri: FACEBOOK_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      });

      if (result.type === 'success' && result.authentication?.accessToken) {
        // Get user info from Facebook Graph API
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${result.authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        const userData = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture?.data?.url,
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('=== FACEBOOK LOGIN SUCCESS ===');
        console.log('User ID:', userData.id);
        console.log('User Name:', userData.name);
        console.log('=== END FACEBOOK LOGIN SUCCESS ===');
      } else {
        console.log('Facebook login cancelled or failed');
      }
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear user data from storage
      await AsyncStorage.removeItem('user');
      console.log('=== USER SIGNED OUT ===');
      console.log('Cleared user data from storage');
      console.log('=== END USER SIGNED OUT ===');
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signInWithFacebook, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
