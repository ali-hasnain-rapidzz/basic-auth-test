import React, { createContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

export type User = {
  id: string;
  name: string;
  email: string;
  // Add any other user fields you need
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type AuthContextData = {
  user?: User;
  isAuthenticated: boolean;
  loadingUserData: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void | AxiosError>;
  signOut: () => void;
};

const AuthContext = createContext({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);

  useEffect(() => {
    // Optionally, you can fetch user data on initial load if you have a token stored
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUser();
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    try {
      const response = await axios.post('/api/signin', credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to sign in', error);
      return error;
    }
  };

  // const signOut = () => {
  //   axios.post('/api/signout')
  //     .then(() => {
  //       setUser(undefined);
  //       setIsAuthenticated(false);
  //     })
  //     .catch((error) => {
  //       console.error('Failed to sign out', error);
  //     });
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loadingUserData,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
