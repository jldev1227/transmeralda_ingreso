// lib/axios.ts
import axios from "axios";

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para manejar cookies de sesión
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
        error.response.data?.mensaje === "Credenciales inválidas" ||
        error.response.data?.message === "Credenciales inválidas";
        
      const isLoginPage = window.location.pathname.includes("login");
      
      if (!isLoginError && !isLoginPage) {
        // Redireccionar al login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Tipos comunes para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  mensaje?: string;
  message?: string;
  data?: T;
  usuario?: T;
}

// Servicio de autenticación
export const authService = {
  // Inicio de sesión
  login: async (credentials: { correo: string; password: string }) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>("/api/usuarios/login", credentials);
      return response.data;
    } catch (error) {
      // Manejo específico del error de login
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // Error de credenciales específico
          throw new Error(
            error.response.data.mensaje || 
            error.response.data.message || 
            "Credenciales inválidas"
          );
        }
      }
      throw error;
    }
  },
  
  // Cierre de sesión
  logout: async () => {
    return apiClient.get("/api/usuarios/logout");
  },
  
  // Obtener perfil del usuario
  getProfile: async () => {
    return apiClient.get<ApiResponse<any>>("/api/usuarios/perfil");
  },
  
  // Solicitar cambio de contraseña
  solicitarResetPassword: async (credentials: { correo: string }) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        "/api/usuarios/solicitar-cambio-password",
        credentials
      );
      return response.data;
    } catch (error) {
      // Manejo específico del error
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401 || error.response.status === 404) {
          throw new Error(
            error.response.data.mensaje || 
            error.response.data.message || 
            "Usuario no existente"
          );
        }
      }
      throw error;
    }
  },
  
  // Restablecer contraseña
  resetPassword: async (data: { token: string; password: string; confirmarPassword: string }) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        "/api/usuarios/cambiar-password",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.mensaje || 
          error.response.data.message || 
          "Error al cambiar la contraseña"
        );
      }
      throw error;
    }
  },
  
  // Actualizar perfil de usuario
  updateProfile: async (userData: any) => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        "/api/usuarios/actualizar-perfil",
        userData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.mensaje || 
          error.response.data.message || 
          "Error al actualizar el perfil"
        );
      }
      throw error;
    }
  }
};

export default apiClient;