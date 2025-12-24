import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (role: "buyer" | "supplier") => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("eproc-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: _password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("eproc-user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eproc-user");
  };

  const switchUser = (role: "buyer" | "supplier") => {
    const demoUsers = {
      buyer: {
        id: "user-1",
        email: "maria.silva@anastacio.com",
        password: "",
        name: "Maria Silva",
        role: "BUYER" as const,
        phone: "(11) 99999-1234",
        department: "Compras",
        supplierId: null,
        createdAt: new Date(),
      },
      supplier: {
        id: "user-2",
        email: "roberto.costa@quimicabrasil.com",
        password: "",
        name: "Roberto Costa",
        role: "SUPPLIER" as const,
        phone: "(11) 98888-5678",
        department: null,
        supplierId: "supplier-1",
        createdAt: new Date(),
      },
    };
    
    const newUser = demoUsers[role];
    setUser(newUser);
    localStorage.setItem("eproc-user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
