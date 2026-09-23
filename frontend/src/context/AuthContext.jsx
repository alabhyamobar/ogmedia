import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ogmedia_operative_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = ({ email, password, codename }) => {
    const derivedName = codename || email.split('@')[0].toUpperCase();
    const newUser = {
      codename: derivedName.startsWith('AGENT-') ? derivedName : `AGENT-${derivedName}`,
      email,
      clearance: 'LEVEL 04 CLEARANCE',
      division: 'CHRONICLE STORYBOARD // DIVISION 01',
      avatar: '⚡',
      badge: 'ARCH-01',
      timestamp: new Date().toLocaleTimeString(),
    };
    setUser(newUser);
    return newUser;
  };

  const signup = ({ codename, email, password, division }) => {
    const newUser = {
      codename: codename.toUpperCase().startsWith('AGENT-') ? codename.toUpperCase() : `AGENT-${codename.toUpperCase()}`,
      email,
      clearance: 'LEVEL 01 INITIATE',
      division: division || 'ARCHIVE OPERATIONS',
      avatar: '⚔️',
      badge: 'INITIATE-01',
      timestamp: new Date().toLocaleTimeString(),
    };
    setUser(newUser);
    return newUser;
  };

  const quickDemoLogin = () => {
    const demoUser = {
      codename: 'AGENT-GHOST',
      email: 'operative.ghost@ogmedia.archive',
      clearance: 'LEVEL 05 SPECIAL OPS',
      division: 'CYBER-MANHWA CIPHER SQUAD',
      avatar: '🔥',
      badge: 'COMMANDER',
      timestamp: new Date().toLocaleTimeString(),
    };
    setUser(demoUser);
    return demoUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
