"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Algo salió mal!
          </h2>

          <div className="mt-3 mb-6">
            <p className="text-gray-600 mb-2">
              Se ha producido un error al cargar esta página.
            </p>

            {/* Mostrar detalles del error solo en entorno de desarrollo */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40">
                <p className="text-sm font-medium text-gray-900">Error:</p>
                <p className="text-sm text-gray-700 font-mono break-all">
                  {error.message || "Error desconocido"}
                </p>
                {error.stack && (
                  <>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      Stack:
                    </p>
                    <p className="text-xs text-gray-700 font-mono break-all">
                      {error.stack}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              className="flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => reset()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </button>

            <button
              className="flex items-center justify-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => (window.location.href = "/")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
