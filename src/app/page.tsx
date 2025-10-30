
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
    // Si routeInfo no existe, es un indicador de que no hay datos válidos.
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
    let response: Response;
    try {
      response = await fetch(`https://control.puntoexacto.ec/api/get_despacho/${unitIdToFetch}`);
      
      if (response.status === 401) {
        handleLogoutAndRedirect("La sesión ha expirado. Por favor, inicie sesión de nuevo.");
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error de API: ${response.status}`);
        throw new Error(`Error de API (${response.status}): ${errorText}`);
      }

      const rawData: RawApiData = await response.json();
      const processedData = processRawDataForPage(rawData, unitIdToFetch);

      if (processedData) {
        setPageData(processedData);
      } else {
        throw new Error("No se encontraron datos de despacho para la unidad. La respuesta puede no ser válida.");
      }

    } catch (err) {
      console.error(`Error crítico al obtener datos para la unidad ${unitIdToFetch}:`, err);
      // No cerramos sesión por errores de red o 500, etc.
      // Si pageData existe, el usuario puede seguir viendo la última info válida.
      if (!pageData) {
        // Si es la carga inicial y falla, no hay nada que mostrar. Lo mejor es redirigir.
        handleLogoutAndRedirect("No se pudo cargar la información inicial. Por favor, inicie sesión de nuevo.");
      } else {
        // Si es un refresh, mostramos toast pero no redirigimos.
        toast({
          title: "Error de Actualización",
          description: err instanceof Error ? err.message : "No se pudo refrescar la información.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [processRawDataForPage, handleLogoutAndRedirect, pageData, toast]);

  useEffect(() => {
    const unitIdFromStorage = localStorage.getItem('currentUnitId');
    if (!unitIdFromStorage) {
      router.push('/login');
    } else {
      setCurrentUnitId(unitIdFromStorage);
      fetchPageData(unitIdFromStorage);
    }
  }, [router, fetchPageData]);

  if (isLoading || !currentUnitId || !pageData) {
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
