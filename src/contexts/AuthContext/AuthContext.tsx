import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

export type User = {
  id: string;
  name: string;
  email: string;
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

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/user', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(error => {
          console.error('Failed to fetch user data', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoadingUserData(false);
        });
    } else {
      setLoadingUserData(false);
    }
  }, []);

  const signIn = async (credentials: SignInCredentials): Promise<void | AxiosError> => {
    try {
      const response = await axios.post('/api/signin', credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return;
    } catch (error) {
      return error as AxiosError;
    }
  };

  const signOut = () => {
    axios.post('/api/signout')
      .then(() => {
        localStorage.removeItem('token');
        setUser(undefined);
        setIsAuthenticated(false);
      })
      .catch(error => {
        console.error('Failed to sign out', error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loadingUserData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
