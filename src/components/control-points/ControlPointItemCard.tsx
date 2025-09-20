
import type { ControlPoint } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ControlPointItemCardProps {
  point: ControlPoint;
}

export default function ControlPointItemCard({ point }: ControlPointItemCardProps) {
  const { status, isCurrent } = point;
  const statusValue = status ? parseInt(status, 10) : NaN;

  const cardClasses = cn(
    "rounded-lg transition-all duration-300 p-1.5 sm:p-2 shadow-md", // Base styles for all
    isCurrent
      ? "border-2" // Current item: Thicker border
      : "border border-dashed border-primary", // Non-current items
    // Conditional background/border color for the current item
    isCurrent && (isNaN(statusValue) || statusValue >= 1) && "border-primary bg-primary/10",
    isCurrent && !isNaN(statusValue) && statusValue <= 0 && "border-green-600 bg-green-500/10"
  );

  const displayScheduledTime = point.scheduledTime && typeof point.scheduledTime === 'string' && point.scheduledTime.length >= 5
    ? point.scheduledTime.substring(0, 5)
    : point.scheduledTime;
  
  const displayMetaTime = point.metaTime && typeof point.metaTime === 'string' && point.metaTime.length >= 5
    ? point.metaTime.substring(0, 5)
    : point.metaTime;

  // Logic for status text color based on its numeric value
  let statusColorClass = 'text-foreground'; // Default color
  if (!isNaN(statusValue)) {
    if (statusValue > 0) {
      statusColorClass = 'text-destructive'; // Red for late
    } else { // Handles <= 0
      statusColorClass = 'text-green-600'; // Green for early or on-time
    }
  }

  // Show meta info only if it's the current point OR if it's a past point that has a status.
  const showMetaInfo = (isCurrent || point.meta) && point.status;


  return (
    <Card className={cardClasses} id={`control-point-card-${point.id}`}>
      <CardContent className="flex flex-col p-0 gap-1">
        <div className="flex justify-between items-center text-3xl sm:text-4xl">
          <span className="text-foreground font-semibold">{point.name}</span>
          <span className="text-foreground font-semibold">{displayScheduledTime}</span>
        </div>
        {showMetaInfo && (
          <div className="flex justify-between items-center font-bold text-4xl sm:text-5xl">
            <div>
              <span>{point.meta}</span>
              {point.metaTime && <span className="ml-2">{displayMetaTime}</span>}
            </div>
            {point.status && <span className={cn(statusColorClass, "font-bold")}>{point.status}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
