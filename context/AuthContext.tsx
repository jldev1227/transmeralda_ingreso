// contexts/AuthContext.tsx
import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/axios";

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  success: boolean;
  mensaje?: string;
  usuario?: T;
  data?: T;
}

// Tipo para el usuario
type User = {
  id: string;
  nombre: string;
  correo: string;
  role: string;
  permisos: {
    flota: boolean;
    nomina: boolean;
    admin: boolean;
  };
};

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: {
    correo: string;
    password: string;
  }) => Promise<ApiResponse<unknown>>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Consulta para obtener el perfil del usuario
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<User>>(
          "/api/usuarios/perfil",
        );

        if (!data.success) {
          throw new Error(data.mensaje || "Error al obtener perfil de usuario");
        }

        if (!data.usuario) {
          throw new Error("No se recibieron datos de usuario");
        }

        return data.usuario;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(
            error.response?.data?.mensaje ||
              `Error de servidor: ${error.response?.status}` ||
              "Error de conexión",
          );
        } else if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("Error desconocido al obtener perfil de usuario");
        }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Limitar reintentos para no bloquear al usuario
  });

  // Mutación para el inicio de sesión
  const loginMutation = useMutation<
    ApiResponse<unknown>,
    Error,
    { correo: string; password: string }
  >({
    mutationFn: async (credentials) => {
      try {
        const { data } = await apiClient.post<ApiResponse<unknown>>(
          "/api/usuarios/login",
          credentials,
        );

        if (!data.success) {
          throw new Error(data.mensaje || "Credenciales inválidas");
        }

        return data;
      } catch (error) {
        // Formatear mensaje de error para mostrar al usuario
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            throw new Error("Credenciales inválidas");
          } else if (error.response?.data?.mensaje) {
            throw new Error(error.response.data.mensaje);
          } else if (!error.response) {
            throw new Error("Error de conexión al servidor");
          } else {
            throw new Error(`Error del servidor: ${error.response.status}`);
          }
        } else if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("Error al iniciar sesión");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/dashboard");
    },
  });

  // Mutación para cerrar sesión
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      try {
        await apiClient.get("/api/usuarios/logout");
      } catch (error) {
        // Incluso si hay un error, intentamos limpiar el estado del cliente
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("Error desconocido al cerrar sesión");
        }
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      router.push("/login");
    },
    onError: () => {
      // Incluso en caso de error, forzamos el cierre de sesión en el cliente
      queryClient.setQueryData(["user"], null);
      router.push("/login");
    },
  });

  // Verificar permiso del usuario
  const checkPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;

    return !!user.permisos[permission as keyof typeof user.permisos];
  };

  // Si hay un error grave durante la carga del perfil, redirigir a la página de error
  if (error && !isLoading) {
    // Redirigir a error.tsx con el error como query param
    router.push(`/error?message=${encodeURIComponent(error.message)}`);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
