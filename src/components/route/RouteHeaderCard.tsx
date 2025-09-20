
import type { RouteInfo } from '@/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface RouteHeaderCardProps {
  routeInfo: RouteInfo;
}

export default function RouteHeaderCard({ routeInfo }: RouteHeaderCardProps) {
  let despachoString = "Despacho: N/A";

  const timePart = routeInfo.currentTime && /^\d{2}:\d{2}:\d{2}$/.test(routeInfo.currentTime)
    ? routeInfo.currentTime.substring(0, 5)
    : null;

  if (routeInfo.currentDate && /^\d{4}-\d{2}-\d{2}$/.test(routeInfo.currentDate)) {
    try {
      const dateObject = parseISO(routeInfo.currentDate);
      if (isValid(dateObject)) {
        const formattedDate = format(dateObject, "dd/MM/yyyy");
        despachoString = `Despacho: ${formattedDate}${timePart ? ` ${timePart}` : ''}`;
      }
    } catch (error) {
      console.warn("RouteHeaderCard: Could not parse or format date:", routeInfo.currentDate, error);
    }
  }


  return (
    <Card className="shadow-xl">
      <CardContent className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
        <Image
          src="https://control.puntoexacto.ec/images/logo.png"
          alt="Logo de la Empresa"
          width={60} 
          height={40} 
          className="h-10 w-auto object-contain"
          data-ai-hint="company logo"
        />
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-wide">{routeInfo.routeName}</h1>
          <p className="text-lg font-bold text-muted-foreground">
            {despachoString}
          </p>
          <div className="flex items-baseline gap-4">
            <p className="text-xl font-bold text-primary">{routeInfo.unitId}</p>
            {(typeof routeInfo.totalAT === 'number' || typeof routeInfo.totalAD === 'number') && (
              <p className="text-lg text-foreground">
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
