"use client";

import { useState } from "react";
import Link from "next/link";
import { AtSymbolIcon } from "@heroicons/react/24/outline";
import "@/styles/divider.css";
import { isAxiosError } from "axios";

import { authService } from "@/lib/axios";

export default function ForgetPassword() {
  const [correo, setCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Aquí iría la llamada a tu API para solicitar el restablecimiento de contraseña
      const response = await authService.solicitarResetPassword({ correo });

      if (response.success) {
        setSuccess(true);
        setMessage(response.message);
      }
    } catch (err) {
      // Manejo más específico de errores
      if (err instanceof Error) {
        // Usar el mensaje detallado que viene del servicio
        setError(err.message);
      } else if (isAxiosError(err)) {
        // Manejar errores de red de Axios
        if (!err.response) {
          setError("Error de conexión. Verifica tu conexión a internet.");
        } else {
          const statusCode = err.response.status;
          const errorMessage = err.response.data?.message;

          if (statusCode === 401) {
            setError(
              errorMessage ||
                "No se encontró ninguna cuenta con este correo electrónico.",
            );
          } else if (statusCode === 429) {
            setError(
              "Demasiadas solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.",
            );
          } else if (statusCode === 400) {
            setError(
              errorMessage ||
                "Solicitud inválida. Verifica que el correo sea correcto.",
            );
          } else {
            setError(
              errorMessage || "Error en el servidor. Intenta más tarde.",
            );
          }
        }
      } else {
        // Para cualquier otro tipo de error
        setError("Error inesperado. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2E8B57] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="custom-shape-divider-bottom-1741641867">
        <svg
          data-name="Layer 1"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="shape-fill"
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
          />
        </svg>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-lg relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Bienvenido
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 relative mb-5">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-10 border p-2"
                id="email"
                name="email"
                placeholder="usuario@ejemplo.com"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#267349] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              type="submit"
            >
              {isSubmitting
                ? "Enviando instrucciones..."
                : "Solicitar instrucciones"}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
          <Link className="text-emerald-600" href={"/"}>
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
