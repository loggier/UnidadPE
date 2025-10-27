
import type { RouteInfo } from '@/types';
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
        {/* Columna Izquierda: Velocidad */}
        <div className="flex flex-col items-center justify-center shrink-0 w-32 sm:w-40 bg-muted rounded-md p-2">
          {typeof routeInfo.speed === 'number' ? (
            <div className="flex flex-col items-center justify-center gap-1 text-foreground">
              <Gauge size={48} className="text-primary"/>
              <span className="font-bold text-5xl">{routeInfo.speed}</span>
              <span className="font-semibold text-xl -mt-1">km/h</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <Gauge size={48} />
              <span className="font-bold text-5xl">--</span>
              <span className="font-semibold text-xl -mt-1">km/h</span>
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
