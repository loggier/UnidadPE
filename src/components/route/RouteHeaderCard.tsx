
import type { RouteInfo } from '@/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

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
        {/* Columna Izquierda: Logo y Velocidad */}
        <div className="flex flex-col items-center justify-center shrink-0 w-32 sm:w-40">
          <div className="relative w-full h-16 sm:h-20">
            <Image
              src="https://control.puntoexacto.ec/images/logo.png"
              alt="Logo de la Empresa"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 8rem, 10rem"
              data-ai-hint="company logo"
              priority
            />
          </div>
          {typeof routeInfo.speed === 'number' && (
            <div className="flex items-center gap-1.5 text-foreground mt-1">
              <Gauge size={24} className="text-primary"/>
              <span className="font-bold text-2xl">{routeInfo.speed} km/h</span>
            </div>
          )}
        </div>
        
        {/* Columna Derecha: Información de la ruta */}
        <div className="flex-1">
          <h1 className="font-bold text-foreground tracking-wide leading-tight" style={{ fontSize: '32px' }}>{routeInfo.routeName}</h1>
          
          {timePart && (
            <div className="flex items-center gap-4" style={{ fontSize: '32px' }}>
              <p className="leading-tight">
                <span className="font-bold">Despacho:</span> <span className="font-bold text-foreground">{timePart}</span>
              </p>
            </div>
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
