"use client"

import React from 'react';
import { 
    Calendar, Truck, Users, Building2, FileText, ChevronRight, 
    TrendingUp, Activity, Clock, ArrowUpRight, Gauge 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';

// Mapeo de roles a etiquetas legibles con emerald como color principal
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
    gestor_servicio: { label: 'Gestor de Servicios', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    gestor_planillas: { label: 'Gestor de Planillas', color: 'bg-gradient-to-br from-teal-400 to-teal-600' },
    liquidador: { label: 'Liquidador', color: 'bg-gradient-to-br from-emerald-500 to-green-600' },
    facturador: { label: 'Facturador', color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    aprobador: { label: 'Aprobador', color: 'bg-gradient-to-br from-emerald-600 to-emerald-800' },
    gestor_flota: { label: 'Gestor de Flota', color: 'bg-gradient-to-br from-emerald-400 to-green-500' },
    gestor_nomina: { label: 'Gestor de Nómina', color: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
    kilometraje: { label: 'Control de Kilometraje', color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    usuario: { label: 'Usuario', color: 'bg-gradient-to-br from-gray-400 to-gray-600' },
};

// Interface para tarjeta de estadísticas
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
}

const StatCard = ({ title, value, subtitle, icon, trend, trendValue, color }: StatCardProps) => {
    return (
        <Card className="glass-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardBody className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                    <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        {icon}
                    </div>
                </div>
                {trend && trendValue && (
                    <div className="mt-4 flex items-center gap-1 pt-4 border-t border-gray-100">
                        <ArrowUpRight size={14} className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'} />
                        <span className={`text-sm font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trendValue}
                        </span>
                        <span className="text-xs text-gray-500">vs mes anterior</span>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

// Componente de tarjeta de sistema mejorado
interface SystemCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    available: boolean;
    route?: string;
}

const SystemCard = ({ title, description, icon, color, available, route }: SystemCardProps) => {
    const handlePress = (route?: string) => {
        if (!available || !route) return;
        window.open(route, '_blank');
    }

    return (
        <Card
            isPressable={available}
            onPress={() => handlePress(route)}
            className={`glass-card border-0 transition-all duration-300 group
                ${available
                    ? "shadow-sm hover:shadow-xl cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
        >
            <CardBody className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 ${available ? color : 'bg-gradient-to-br from-gray-300 to-gray-400'} rounded-2xl flex items-center justify-center text-white shadow-lg ${available ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
                            {available && (
                                <ChevronRight size={20} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{description}</p>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={available ? "success" : "default"}
                            className="h-6 font-medium"
                        >
                            <span className="text-xs">{available ? '✓ Disponible' : '✕ Sin acceso'}</span>
                        </Chip>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

// Componente de actividad reciente
interface ActivityItemProps {
    message: string;
    time: string;
    icon: React.ReactNode;
    color: string;
}

const ActivityItem = ({ message, time, icon, color }: ActivityItemProps) => {
    return (
        <div className="flex items-start gap-4 p-4 hover:bg-emerald-50/50 rounded-2xl transition-all duration-200 group cursor-pointer">
            <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium text-sm leading-relaxed">{message}</p>
                <p className="text-gray-500 text-xs mt-1.5 flex items-center gap-1">
                    <Clock size={12} />
                    {time}
                </p>
            </div>
        </div>
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

    const getRoleInfo = (role: string) => {
        return ROLE_LABELS[role] || ROLE_LABELS.usuario;
    };

    // Estadísticas de ejemplo (en producción vendrían de una API)
    const dashboardStats = [
        {
            title: 'Planillas Activas',
            value: 45,
            subtitle: 'En proceso',
            icon: <FileText size={24} />,
            trend: 'up' as const,
            trendValue: '+12.5%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
        },
        {
            title: 'Conductores',
            value: 127,
            subtitle: 'Registrados',
            icon: <Users size={24} />,
            trend: 'up' as const,
            trendValue: '+5.2%',
            color: 'bg-gradient-to-br from-teal-400 to-emerald-600'
        },
        {
            title: 'Vehículos',
            value: 89,
            subtitle: 'En servicio',
            icon: <Truck size={24} />,
            trend: 'up' as const,
            trendValue: '+3.1%',
            color: 'bg-gradient-to-br from-green-400 to-emerald-600'
        },
        {
            title: 'Servicios',
            value: '1,842',
            subtitle: 'Este mes',
            icon: <Activity size={24} />,
            trend: 'up' as const,
            trendValue: '+8.3%',
            color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }
    ];

    // Actividades recientes de ejemplo
    const recentActivities = [
        {
            message: 'Nueva planilla creada - Conductor: Juan Pérez',
            time: 'Hace 5 minutos',
            icon: <FileText size={18} className="text-white" />,
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
        },
        {
            message: 'Planilla #1234 fue liquidada exitosamente',
            time: 'Hace 15 minutos',
            icon: <TrendingUp size={18} className="text-white" />,
            color: 'bg-gradient-to-br from-teal-400 to-emerald-600'
        },
        {
            message: 'Nuevo vehículo registrado - Placa: ABC-123',
            time: 'Hace 32 minutos',
            icon: <Truck size={18} className="text-white" />,
            color: 'bg-gradient-to-br from-green-400 to-emerald-600'
        },
        {
            message: 'Kilometraje actualizado para 5 vehículos',
            time: 'Hace 1 hora',
            icon: <Gauge size={18} className="text-white" />,
            color: 'bg-gradient-to-br from-amber-500 to-orange-600'
        }
    ];

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-emerald-700 font-medium">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    const roleInfo = getRoleInfo(user.role);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <div className="container mx-auto p-6 space-y-6">
                {/* Encabezado con información del usuario */}
                <Card className="glass-card border-0 shadow-lg">
                    <CardBody className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-start gap-5">
                                <div className={`h-20 w-20 ${roleInfo.color} rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl ring-4 ring-white/50`}>
                                    {user.nombre.split(' ').map(name => name[0]).join('').substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">{user.nombre}</h1>
                                        <Chip
                                            size="sm"
                                            className={`${roleInfo.color} text-white shadow-md`}
                                        >
                                            <span className="font-semibold">{roleInfo.label}</span>
                                        </Chip>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">{user.correo}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={14} className="text-emerald-600" />
                                        <span>Último acceso: <span className="text-emerald-600 font-semibold">{formatDate(user.ultimo_acceso)}</span></span>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onPress={logout} 
                                color="danger" 
                                variant="flat"
                                size="lg"
                                startContent={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                    </svg>
                                }
                                className="w-full lg:w-auto font-semibold"
                            >
                                Cerrar Sesión
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Título de página */}
                <div className="px-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard General</h2>
                    <p className="text-gray-600">Resumen de actividades y acceso a sistemas</p>
                </div>

                {/* Grid de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardStats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Actividad reciente */}
                    <div className="lg:col-span-2">
                        <Card className="glass-card border-0 shadow-lg">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="success"
                                        className="text-emerald-600 font-semibold hover:bg-emerald-100"
                                    >
                                        Ver todo
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    {recentActivities.map((activity, index) => (
                                        <ActivityItem key={index} {...activity} />
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Accesos rápidos */}
                    <div>
                        <Card className="glass-card border-0 shadow-lg">
                            <CardBody className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Accesos Directos</h2>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700"
                                        size="lg"
                                        endContent={<ChevronRight size={20} />}
                                    >
                                        <span className="font-semibold">Nueva Planilla</span>
                                    </Button>
                                    <Button
                                        className="w-full justify-between font-semibold hover:bg-emerald-50 hover:border-emerald-300"
                                        variant="bordered"
                                        size="lg"
                                        endContent={<ChevronRight size={20} />}
                                    >
                                        <span>Ver Reportes</span>
                                    </Button>
                                    <Button
                                        className="w-full justify-between font-semibold hover:bg-emerald-50 hover:border-emerald-300"
                                        variant="bordered"
                                        size="lg"
                                        endContent={<ChevronRight size={20} />}
                                    >
                                        <span>Configuración</span>
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Sistemas disponibles */}
                <div className="px-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-5">Sistemas Disponibles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <SystemCard
                            title="Nómina"
                            description="Gestión de nóminas y pagos"
                            icon={<Calendar size={24} />}
                            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
                            available={user.role === 'admin' || user.permisos.nomina || user.role === 'gestor_nomina'}
                            route={process.env.NEXT_PUBLIC_NOMINA_URL}
                        />
                        <SystemCard
                            title="Servicios"
                            description="Control de servicios y planillas"
                            icon={<FileText size={24} />}
                            color="bg-gradient-to-br from-teal-400 to-emerald-600"
                            available={
                                user.role === 'admin' ||
                                user.role === 'gestor_servicio' ||
                                user.role === 'gestor_planillas' ||
                                user.role === 'kilometraje'
                            }
                            route={process.env.NEXT_PUBLIC_SERVICIOS_URL}
                        />
                        <SystemCard
                            title="Flota"
                            description="Administración de vehículos"
                            icon={<Truck size={24} />}
                            color="bg-gradient-to-br from-green-400 to-emerald-600"
                            available={user.role === 'admin' || user.permisos.flota || user.role === 'gestor_flota'}
                            route={process.env.NEXT_PUBLIC_FLOTA_URL}
                        />
                        <SystemCard
                            title="Empresas"
                            description="Gestión de empresas y clientes"
                            icon={<Building2 size={24} />}
                            color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            available={user.role === 'admin' || user.permisos.admin}
                            route={process.env.NEXT_PUBLIC_EMPRESAS_URL}
                        />
                        <SystemCard
                            title="Conductores"
                            description="Base de datos de conductores"
                            icon={<Users size={24} />}
                            color="bg-gradient-to-br from-emerald-400 to-green-500"
                            available={user.role === 'admin' || user.permisos.flota || user.role === 'gestor_flota'}
                            route={process.env.NEXT_PUBLIC_CONDUCTORES_URL}
                        />
                        <SystemCard
                            title="Kilometraje"
                            description="Control de kilometraje de vehículos"
                            icon={<Gauge size={24} />}
                            color="bg-gradient-to-br from-amber-500 to-orange-600"
                            available={user.role === 'admin' || user.role === 'kilometraje' || user.permisos.kilometraje === true}
                            route={process.env.NEXT_PUBLIC_SERVICIOS_URL}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
