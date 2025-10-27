
import type { RouteInfo } from '@/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface RouteHeaderCardProps {
  routeInfo: RouteInfo;
}

export default function RouteHeaderCard({ routeInfo }: RouteHeaderCardProps) {
  const timePart = routeInfo.currentTime && /^\d{2}:\d{2}:\d{2}$/.test(routeInfo.currentTime)
    ? routeInfo.currentTime.substring(0, 5)
    : null;

  return (
    <Card className="shadow-xl">
      <CardContent className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
        {/* Contenedor del logo con tamaño relativo para un mejor escalado */}
        <div className="relative w-20 h-10 sm:w-24 sm:h-12 shrink-0">
          <Image
            src="https://control.puntoexacto.ec/images/logo.png"
            alt="Logo de la Empresa"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 5rem, 6rem" // Proporciona pistas al navegador para la optimización
            data-ai-hint="company logo"
            priority // Carga la imagen con prioridad ya que es LCP
          />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-foreground tracking-wide leading-tight" style={{ fontSize: '32px' }}>{routeInfo.routeName}</h1>
          {timePart && (
             <p className="leading-tight" style={{ fontSize: '32px' }}>
                <span className="font-bold">Despacho:</span> <span className="font-bold text-foreground">{timePart}</span>
             </p>
          )}
          <div className="flex items-baseline gap-4" style={{ fontSize: '32px' }}>
            <p className="font-bold text-primary">{routeInfo.unitId}</p>
            {(typeof routeInfo.totalAT === 'number' || typeof routeInfo.totalAD === 'number') && (
              <p className="text-foreground">
                {typeof routeInfo.totalAT === 'number' && (
                  <>
                    AT: <span className="font-semibold">{routeInfo.totalAT}</span>
                  </>
                )}
                {typeof routeInfo.totalAT === 'number' && typeof routeInfo.totalAD === 'number' && " | "}
                {typeof routeInfo.totalAD === 'number' && (
                  <>
                    AD: <span className="font-semibold">{routeInfo.totalAD}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
