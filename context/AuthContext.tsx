"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AxiosError, isAxiosError } from "axios";
import apiClient, { authService, ApiResponse } from "@/config/apiClient";
import LoadingPage from "@/components/loadingPage";

// Definir la interfaz para el usuario
export interface User {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  role: "admin" | "gestor_servicio" | "gestor_planillas" | "liquidador" | "facturador" | "aprobador" | "gestor_flota" | "gestor_nomina" | "usuario";
  permisos: {
    flota: boolean;
    nomina: boolean;
    admin: boolean;
    [key: string]: boolean | undefined;
  };
  ultimo_acceso?: string;
}

// Credenciales de login
interface LoginCredentials {
  correo: string;
  password: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  checkPermission: (permission: string) => boolean;
  solicitarResetPassword: (credentials: { correo: string }) => Promise<void>;
  resetPassword: (data: { token: string; password: string; confirmarPassword: string }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Valor predeterminado para el contexto
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  isAuthenticated: false,
  checkPermission: () => false,
  solicitarResetPassword: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
};

// Crear el contexto con el valor predeterminado
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getProfile();
      const data = response.data;

      if (!data.success) {
        throw new Error(data.mensaje || data.message || "Error al obtener perfil de usuario");
      }

      const userData = data.usuario || data.data;
      
      if (!userData) {
        throw new Error("No se recibieron datos de usuario");
      }

      setUser(userData);
      
      // Si el usuario está en la página de login y ya está autenticado, redirigir al dashboard
      if (pathname === '/' || pathname === '/login') {
        router.push('/dashboard');
      }
      
    } catch (err) {
      handleApiError(err, "Error al obtener perfil");
      setUser(null);
      
      // Si el error es de autenticación y NO estamos ya en la página de login, redirigir al login
      if (isAxiosError(err) && err.response?.status === 401 && pathname !== '/' && pathname !== '/login') {
        router.push("/");
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
        setInitializing(false);
      }, 300); // Pequeño retraso para evitar parpadeos
    }
  };

  // Manejar errores de API de manera consistente
  const handleApiError = (err: unknown, defaultMessage: string): void => {
    if (isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiResponse<any>>;

      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const errorMessage = 
          axiosError.response.data?.mensaje || 
          axiosError.response.data?.message;

        if (statusCode === 401) {
          setError("Sesión expirada o credenciales inválidas");
        } else if (statusCode === 403) {
          setError("No tienes permisos para realizar esta acción");
        } else if (statusCode === 404) {
          setError("Recurso no encontrado");
        } else {
          setError(errorMessage || `Error en la petición (${statusCode})`);
        }
      } else if (axiosError.request) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión a internet");
      } else {
        setError(`Error al configurar la petición: ${axiosError.message}`);
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(defaultMessage);
    }
  };

  // Función de inicio de sesión
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.login(credentials);

      if (!data.success) {
        throw new Error(data.mensaje || data.message || "Credenciales inválidas");
      }
      
      // Después de un login exitoso, obtener el perfil del usuario
      await fetchUserProfile();
      
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err) {
      handleApiError(err, "Error al iniciar sesión");
      throw err; // Re-lanzar el error para manejo adicional en el componente
    } finally {
      setLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      await authService.logout();
      
      // Limpiar estado local independientemente de la respuesta del servidor
      setUser(null);
      
      // Redirigir al login
      router.push("/");
    } catch (err) {
      // Incluso si hay un error, limpiamos el estado y redirigimos
      setUser(null);
      router.push("/");
      
      // Registrar el error pero no mostrarlo al usuario en este caso
      console.error("Error durante el cierre de sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Solicitar restablecimiento de contraseña
  const solicitarResetPassword = async (credentials: { correo: string }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.solicitarResetPassword(credentials);
      
      if (!data.success) {
        throw new Error(data.mensaje || data.message || "Error al solicitar cambio de contraseña");
      }
    } catch (err) {
      handleApiError(err, "Error al solicitar cambio de contraseña");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (data: { token: string; password: string; confirmarPassword: string }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(data);
      
      if (!response.success) {
        throw new Error(response.mensaje || response.message || "Error al cambiar la contraseña");
      }
    } catch (err) {
      handleApiError(err, "Error al cambiar la contraseña");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      
      if (!response.success) {
        throw new Error(response.mensaje || response.message || "Error al actualizar el perfil");
      }
      
      // Actualizar el perfil en el estado local
      await fetchUserProfile();
    } catch (err) {
      handleApiError(err, "Error al actualizar el perfil");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar permiso del usuario
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    
    // Verificar si existe el permiso en el objeto de permisos
    return !!user.permisos[permission as keyof typeof user.permisos];
  };

  // Verificar si existe un token y cargar el perfil al inicializar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchUserProfile();
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };
    
    loadProfile();

    // Establecer un tiempo máximo para la inicialización
    const timeoutId = setTimeout(() => {
      if (initializing) {
        setInitializing(false);
      }
    }, 5000); // 5 segundos máximo de espera

    return () => clearTimeout(timeoutId);
  }, []);

  // Determinar si el usuario está autenticado
  const isAuthenticated = !!user;

  // Mostrar pantalla de carga durante la inicialización o mientras se realiza cualquier operación de autenticación
  if (initializing || loading) {
    return <LoadingPage>Verificando acceso</LoadingPage>;
  }

  // Valores y funciones proporcionados por el contexto
  const authContext: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshProfile: fetchUserProfile,
    isAuthenticated,
    checkPermission,
    solicitarResetPassword,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;