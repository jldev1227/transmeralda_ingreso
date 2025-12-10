"use client"

import React, { useEffect, useState } from 'react';
import { 
    Calendar, Truck, Users, Building2, FileText, ChevronRight, 
    Activity, Clock, Clipboard, UserCircle 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import axios from 'axios';

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

// Interface para estadísticas del dashboard
interface DashboardStats {
    vehiculos: number;
    conductores: number;
    empresas: number;
    recargos: number;
    usuarios: number;
}

// Interface para tarjeta de estadísticas
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    isLoading?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, color, isLoading }: StatCardProps) => {
    return (
        <Card className="glass-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardBody className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
                        {isLoading ? (
                            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg mb-1"></div>
                        ) : (
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                        )}
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                    <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        {icon}
                    </div>
                </div>
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

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await axios.get<DashboardStats>(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stats/dashboard`,
                    { withCredentials: true }
                );
                
                setStats(response.data);
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
                setError('No se pudieron cargar las estadísticas');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

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

    // Configurar estadísticas con datos reales
    const dashboardStats = [
        {
            title: 'Vehículos',
            value: stats?.vehiculos ?? 0,
            subtitle: 'Total registrados',
            icon: <Truck size={24} />,
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
        },
        {
            title: 'Conductores',
            value: stats?.conductores ?? 0,
            subtitle: 'Total registrados',
            icon: <Users size={24} />,
            color: 'bg-gradient-to-br from-teal-400 to-emerald-600'
        },
        {
            title: 'Empresas',
            value: stats?.empresas ?? 0,
            subtitle: 'Total registradas',
            icon: <Building2 size={24} />,
            color: 'bg-gradient-to-br from-green-400 to-emerald-600'
        },
        {
            title: 'Planillas',
            value: stats?.recargos ?? 0,
            subtitle: 'Total de recargos',
            icon: <FileText size={24} />,
            color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
        },
        {
            title: 'Usuarios',
            value: stats?.usuarios ?? 0,
            subtitle: 'Total del sistema',
            icon: <UserCircle size={24} />,
            color: 'bg-gradient-to-br from-emerald-600 to-emerald-800'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <div className="container mx-auto p-6 space-y-6">
                {/* Encabezado con información del usuario mejorado */}
                <Card className="glass-card border-0 shadow-lg">
                    <CardBody className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Info del usuario a la izquierda */}
                            <div className="flex items-center gap-4">
                                <div className={`h-16 w-16 ${roleInfo.color} rounded-3xl flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white/50`}>
                                    {user.nombre.split(' ').map(name => name[0]).join('').substring(0, 2)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-xl font-bold text-gray-900">{user.nombre}</h1>
                                        <Chip
                                            size="sm"
                                            className={`${roleInfo.color} text-white shadow-md`}
                                        >
                                            <span className="font-semibold text-xs">{roleInfo.label}</span>
                                        </Chip>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{user.correo}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} className="text-emerald-600" />
                                        <span>Último acceso: <span className="text-emerald-600 font-medium">{formatDate(user.ultimo_acceso)}</span></span>
                                    </div>
                                </div>
                            </div>
                            {/* Logout a la derecha */}
                            <Button 
                                onPress={logout} 
                                color="danger" 
                                variant="flat"
                                size="md"
                                startContent={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                    </svg>
                                }
                                className="font-semibold"
                            >
                                Cerrar Sesión
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Título de página */}
                <div className="px-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Estadísticas del Sistema</h2>
                    <p className="text-gray-600">Resumen general de los datos registrados</p>
                </div>

                {/* Mostrar error si hay */}
                {error && (
                    <Card className="glass-card border-0 shadow-sm border-red-200">
                        <CardBody className="p-4">
                            <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Grid de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {dashboardStats.map((stat, index) => (
                        <StatCard key={index} {...stat} isLoading={isLoading} />
                    ))}
                </div>

                {/* Sistemas disponibles */}
                <div className="px-1 mt-8">
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
                            title="Planillas de Servicio"
                            description="Control y registro de planillas"
                            icon={<Clipboard size={24} />}
                            color="bg-gradient-to-br from-amber-500 to-orange-600"
                            available={user.role === 'admin' || user.role === 'kilometraje' || user.permisos.kilometraje === true}
                            route={process.env.NEXT_PUBLIC_RECARGOS_URL}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
