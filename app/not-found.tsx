"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-emerald-100 p-4 mb-4">
            <FileQuestion className="h-12 w-12 text-emerald-600" />
          </div>

          <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>

          <p className="text-gray-600 mb-8">
            La página que estás buscando no existe o ha sido movida a otra
            ubicación.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              className="flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver atrás
            </button>

            <Link href="/">
              <button className="flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, por favor contacta a soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
