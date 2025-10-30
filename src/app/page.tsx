
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { RouteInfo, ControlPoint, UnitDetails } from '@/types';
import RouteDashboardClient from '@/components/client/RouteDashboardClient';
import { EMPTY_UNIT_DETAILS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';

interface ProcessedClientData {
  routeInfo: RouteInfo;
  controlPoints: ControlPoint[];
  unitAhead: UnitDetails;
  unitBehind: UnitDetails;
}

interface RawApiData {
  routeInfo: RouteInfo;
  controlPoints: ControlPoint[];
  unitAhead: UnitDetails | [];
  unitBehind: UnitDetails | [];
}

export default function RouteSchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [pageData, setPageData] = useState<ProcessedClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogoutAndRedirect = useCallback((message: string) => {
    localStorage.removeItem('currentUnitId');
    toast({
      title: 'Error de Sesión',
      description: message,
      variant: 'destructive',
    });
    router.push('/login');
  }, [router, toast]);
  
  const processRawDataForPage = useCallback((rawData: RawApiData, unitId: string): ProcessedClientData | null => {
    if (!rawData.routeInfo || !rawData.routeInfo.unitId) {
        console.warn(`No se encontraron datos de ruta para la unidad ${unitId}.`);
        return null;
    }
  
    const resolvedRouteInfo = rawData.routeInfo;

    let processedUnitAhead: UnitDetails;
    if (Array.isArray(rawData.unitAhead) && rawData.unitAhead.length === 0) {
      processedUnitAhead = { ...EMPTY_UNIT_DETAILS, id: `empty-ahead-api-${unitId}`, label: 'Adelante' };
    } else if (typeof rawData.unitAhead === 'object' && rawData.unitAhead !== null && !Array.isArray(rawData.unitAhead)) {
      processedUnitAhead = rawData.unitAhead as UnitDetails;
      if (!processedUnitAhead.label) processedUnitAhead.label = 'Adelante';
    } else {
      processedUnitAhead = { ...EMPTY_UNIT_DETAILS, id: `empty-ahead-fallback-api-${unitId}`, label: 'Adelante' };
    }

    let processedUnitBehind: UnitDetails;
    if (Array.isArray(rawData.unitBehind) && rawData.unitBehind.length === 0) {
      processedUnitBehind = { ...EMPTY_UNIT_DETAILS, id: `empty-behind-api-${unitId}`, label: 'Atrás' };
    } else if (typeof rawData.unitBehind === 'object' && rawData.unitBehind !== null && !Array.isArray(rawData.unitBehind)) {
      processedUnitBehind = rawData.unitBehind as UnitDetails;
      if (!processedUnitBehind.label) processedUnitBehind.label = 'Atrás';
    } else {
      processedUnitBehind = { ...EMPTY_UNIT_DETAILS, id: `empty-behind-fallback-api-${unitId}`, label: 'Atrás' };
    }
    
    const processedControlPoints = Array.isArray(rawData.controlPoints) ? rawData.controlPoints : [];
    
    if (resolvedRouteInfo.currentDate && !/^\d{4}-\d{2}-\d{2}$/.test(resolvedRouteInfo.currentDate)) {
        resolvedRouteInfo.currentDate = new Date().toISOString().split('T')[0];
    }

    return {
      routeInfo: resolvedRouteInfo,
      controlPoints: processedControlPoints,
      unitAhead: processedUnitAhead,
      unitBehind: processedUnitBehind,
    };
  }, []);

  const fetchPageData = useCallback(async (unitIdToFetch: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://control.puntoexacto.ec/api/get_despacho/${unitIdToFetch}`);
      
      if (response.status === 401) {
        handleLogoutAndRedirect("La sesión ha expirado. Por favor, inicie sesión de nuevo.");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status}`);
      }

      const rawData: RawApiData = await response.json();
      const processedData = processRawDataForPage(rawData, unitIdToFetch);

      if (processedData) {
        setPageData(processedData);
      } else {
        throw new Error("No se encontraron datos de despacho para la unidad.");
      }

    } catch (err) {
      console.error(`Error crítico al obtener datos para la unidad ${unitIdToFetch}:`, err);
      // No redirigimos al login aquí para evitar bucles.
      // Si la carga inicial falla, el usuario verá el esqueleto de carga y puede reintentar con el refresh del RouteDashboardClient
      // o la página permanecerá en estado de carga.
      // El RouteDashboardClient se encargará de mostrar un estado de error si es necesario.
      toast({
        title: "Error al Cargar Datos",
        description: "No se pudo obtener la información inicial. Compruebe la conexión y vuelva a intentarlo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [processRawDataForPage, handleLogoutAndRedirect, toast]);

  useEffect(() => {
    const unitIdFromStorage = localStorage.getItem('currentUnitId');
    if (!unitIdFromStorage) {
      router.push('/login');
    } else {
      setCurrentUnitId(unitIdFromStorage);
      fetchPageData(unitIdFromStorage);
    }
  }, [router, fetchPageData]);

  if (isLoading && !pageData) { // Solo muestra el esqueleto en la carga inicial
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="space-y-4 w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
             <div className="md:col-span-6">
                <Skeleton className="h-32 w-full" />
             </div>
             <div className="md:col-span-4">
                <Skeleton className="h-32 w-full" />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
            <div className="md:col-span-6 space-y-4">
              <Skeleton className="h-[60vh] w-full" />
            </div>
            <div className="md:col-span-4 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos y no está cargando, es que hubo un error.
  // El RouteDashboardClient mostrará un estado vacío/error.
  if (!pageData || !currentUnitId) {
    // Si pageData es null y no estamos cargando, significa que el fetch inicial falló.
    // Pasamos props vacías/iniciales al cliente para que muestre el estado de error/vacío.
    return (
        <RouteDashboardClient
            initialRouteInfo={{ routeName: 'Error', currentDate: '', unitId: 'N/A' }}
            initialControlPoints={[]}
            initialUnitAhead={{ ...EMPTY_UNIT_DETAILS, id: 'error-ahead', label: 'Adelante' }}
            initialUnitBehind={{ ...EMPTY_UNIT_DETAILS, id: 'error-behind', label: 'Atrás' }}
            currentUnitId={currentUnitId || ''}
        />
    );
  }

  return (
    <RouteDashboardClient
      initialRouteInfo={pageData.routeInfo}
      initialControlPoints={pageData.controlPoints}
      initialUnitAhead={pageData.unitAhead}
      initialUnitBehind={pageData.unitBehind}
      currentUnitId={currentUnitId}
    />
  );
}
