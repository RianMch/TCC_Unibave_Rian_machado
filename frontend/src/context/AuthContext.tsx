import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface Usuario {
  role: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function login(email: string, senha: string) {
    const res = await api.post("/auth/login", { email, senha });
    setUsuario({ role: res.data.role });
  }

  async function logout() {
    await api.post("/auth/logout");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth fora do AuthProvider");
  return context;
}