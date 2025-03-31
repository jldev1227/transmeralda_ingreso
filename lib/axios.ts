// lib/axios.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificar si es un error de autorización global
    if (error.response && error.response.status === 401) {
      // Solo redireccionar si no estamos ya en la página de login
      // Y si el error NO es un error de credenciales específico
      const isLoginError =
        error.response.data?.message === "Credenciales inválidas";

      if (!isLoginError && !window.location.href.includes("login")) {
        window.location.href = "http://midominio.local:5000";
      }
    }

    return Promise.reject(error);
  },
);

// Servicio de autenticación
export const authService = {
  login: async (credentials: { correo: string; password: string }) => {
    try {
      const response = await apiClient.post("/api/usuarios/login", credentials);

      return response.data;
    } catch (error) {
      // Manejo específico del error de login
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // Error de credenciales específico
          throw new Error(
            error.response.data.message || "Credenciales inválidas",
          );
        }
      }
      throw error;
    }
  },
  logout: async () => {
    return apiClient.get("/api/usuarios/logout");
  },
  getProfile: async () => {
    return apiClient.get("/api/usuarios/perfil");
  },
  solicitarResetPassword: async (credentials: { correo: string }) => {
    try {
      const response = await apiClient.post(
        "/api/usuarios/solicitar-cambio-password",
        credentials,
      );

      return response.data;
    } catch (error) {
      // Manejo específico del error de login
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // Error de credenciales específico
          throw new Error(
            error.response.data.message || "Usuario no existente",
          );
        }
      }
      throw error;
    }
  },
};

export default apiClient;
