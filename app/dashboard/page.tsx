"use client"

import React from 'react';
import { Calendar, Truck, Users, Building2, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@heroui/button'
import { Card } from '@heroui/card'

// Componente de tarjeta de sistema
interface SystemCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    available: boolean;
    route?: string;
}

const SystemCard = ({ title, icon, color, available, route }: SystemCardProps) => {
    const handlePress = (route?: string) => {
        if (!available || !route) return;
        window.open(route);
    }

    return (
        <Card
            onPress={() => handlePress(route)}
            isPressable
            className={`p-5 rounded-2xl border transition-all duration-300 group
                ${available
                    ? "bg-white border-emerald-100 shadow hover:shadow-lg hover:border-emerald-600 cursor-pointer"
                    : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-4'>
                    <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform`}>
                        {icon}
                    </div>
                    <div className='text-start'>
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                        <p className={`text-xs mt-1 ${available ? "text-emerald-600" : "text-gray-400"}`}>
                            {available ? 'Acceso completo' : 'Sin acceso'}
                        </p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-emerald-100 group-hover:text-emerald-600 transition-colors" />
            </div>
        </Card>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Nunca";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-emerald-700">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:flex sm:items-start sm:min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 sm:py-20">
            <div className="container mx-auto bg-white/90 sm:rounded-3xl sm:shadow-xl p-10 border border-emerald-100">
                {/* Encabezado */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold shadow">
                            {user.nombre.split(' ').map(name => name[0]).join('')}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-emerald-700">{user.nombre.split(' ')[0]}</h2>
                            <p className="text-sm text-gray-500">{user.correo}</p>
                            <p className="text-xs text-gray-400 mt-1">Último acceso: <span className="text-emerald-600">{formatDate(user.ultimo_acceso)}</span></p>
                        </div>
                    </div>
                    <Button onPress={logout} variant='flat' color='danger' radius='sm' size='sm' className='w-full sm:w-auto p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                        </svg>
                        Cerrar sesión
                    </Button>
                </div>

                {/* Tarjetas de sistema */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <SystemCard
                        title="Nómina"
                        icon={<Calendar size={22} />}
                        color="bg-emerald-600"
                        available={user.role === 'admin' ? !!user.permisos.nomina : !!user.permisos.nomina || user.role === 'gestor_nomina'}
                        route={process.env.NEXT_PUBLIC_NOMINA_URL}
                    />
                    <SystemCard
                        title="Servicios"
                        icon={<FileText size={22} />}
                        color="bg-emerald-600"
                        available={
                            user.role === 'admin'
                                ? !!user.permisos.gestor_servicio || !!user.permisos.gestor_planillas
                                : user.role === 'gestor_servicio' || user.role === 'gestor_planillas'
                        }
                        route={process.env.NEXT_PUBLIC_SERVICIOS_URL}
                    />
                    <SystemCard
                        title="Flota"
                        icon={<Truck size={22} />}
                        color="bg-emerald-600"
                        available={user.role === 'admin' ? !!user.permisos.gestor_flota : !!user.permisos.gestor_flota || user.role === 'gestor_flota'}
                        route={process.env.NEXT_PUBLIC_FLOTA_URL}
                    />
                    <SystemCard
                        title="Empresas"
                        icon={<Building2 size={22} />}
                        color="bg-emerald-600"
                        available={user.role === 'admin' ? !!user.permisos.admin : !!user.permisos.admin}
                        route={process.env.NEXT_PUBLIC_EMPRESAS_URL}
                    />
                    <SystemCard
                        title="Conductores"
                        icon={<Users size={22} />}
                        color="bg-emerald-600"
                        available={user.role === 'admin' ? !!user.permisos.flota : !!user.permisos.flota || user.role === 'gestor_flota'}
                        route={process.env.NEXT_PUBLIC_CONDUCTORES_URL}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
