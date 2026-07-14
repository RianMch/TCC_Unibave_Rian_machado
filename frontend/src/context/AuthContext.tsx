import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface Usuario {
  id: number;
  role: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // começa true: enquanto não checarmos a sessão existente, ninguém deve
  // ser tratado como "deslogado" (evita redirecionar/esconder UI à toa)
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const res = await api.get("/auth/me");
        if (ativo) setUsuario({ id: res.data.id, role: res.data.role });
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  async function login(email: string, senha: string) {
    const res = await api.post("/auth/login", { email, senha });
    setUsuario({ id: res.data.id, role: res.data.role });
  }

  async function logout() {
    await api.post("/auth/logout");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth fora do AuthProvider");
  return context;
}