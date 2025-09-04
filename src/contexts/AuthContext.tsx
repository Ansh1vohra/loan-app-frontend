import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  setEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmailState] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('authToken');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setEmailState(savedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (newToken: string, userEmail: string) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userEmail', userEmail);
    setToken(newToken);
    setEmailState(userEmail);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setToken(null);
    setEmailState(null);
    setIsAuthenticated(false);
  };

  const setEmail = (userEmail: string) => {
    setEmailState(userEmail);
    localStorage.setItem('pendingEmail', userEmail);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      token,
      email,
      login,
      logout,
      setEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};