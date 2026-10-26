import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Ajuste o caminho se necessário

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth fora do AuthProvider");
  return context;
}