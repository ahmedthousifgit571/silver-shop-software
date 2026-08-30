'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

const PUBLIC_ROUTES = ['/login', '/p']; // /p/[sku] is public verification

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check saved session in localStorage
    const savedUser = localStorage.getItem('silver_shop_admin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('silver_shop_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Protect private routes
  useEffect(() => {
    if (isLoading) return;

    const isPublic =
      PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith('/p/') ||
      pathname.startsWith('/invoice/');

    if (!user && !isPublic && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Admin login
    if (cleanEmail === 'admin@gmail.com' && pass === 'admin123') {
      const adminUser: User = {
        email: 'admin@gmail.com',
        name: 'Store Owner (Admin)',
        role: 'ADMIN',
      };
      setUser(adminUser);
      localStorage.setItem('silver_shop_admin_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // 2. Staff / Cashier login
    if (cleanEmail === 'staff@gmail.com' && pass === 'staff123') {
      const staffUser: User = {
        email: 'staff@gmail.com',
        name: 'POS Cashier (Staff)',
        role: 'STAFF',
      };
      setUser(staffUser);
      localStorage.setItem('silver_shop_admin_user', JSON.stringify(staffUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use admin@gmail.com (admin123) or staff@gmail.com (staff123)',
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('silver_shop_admin_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
