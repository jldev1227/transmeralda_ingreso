"use client";

import React, { useState } from "react";
import "@/styles/divider.css";
import {
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { authService } from "@/lib/axios";

const Home = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ correo: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Usando el servicio centralizado de autenticación
      const response = await authService.login(credentials);

      // Si el login es exitoso, redirigir al usuario según sus permisos
      const { usuario } = response;

      if (usuario.permisos.admin) {
        window.location.href = "http://midominio.local:3000/dashboard";
      } else if (usuario.permisos.flota) {
        window.location.href = "http://flota.midominio.local:3000";
      } else if (usuario.permisos.nomina) {
        window.location.href = "http://nomina.midominio.local:3000";
      } else {
        // Usuario sin permisos específicos
        window.location.href = "http://midominio.local:5000";
      }
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
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
                value={credentials.correo}
                onChange={(e) =>
                  setCredentials({ ...credentials, correo: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                required
                className="password-input pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-10 border p-2"
                id="password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label
                className="ml-2 block text-sm text-gray-700"
                htmlFor="remember-me"
              >
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a
                className="font-medium text-emerald-600 hover:text-emerald-500"
                href="/forget-password"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#267349] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              type="submit"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
          <p className="text-gray-600">¿Requieres una cuenta?</p>

          <div>
            <span className="text-gray-600">
              Solicitala al siguiente correo
            </span>

            <a
              className="ml-1 font-medium text-emerald-600 hover:text-emerald-500"
              href="#"
            >
              soporte@transmeralda.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
