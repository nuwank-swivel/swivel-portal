import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Armchair, Monitor } from "lucide-react";

export type SeatStatus = "available" | "booked" | "pending";

export interface Seat {
  id: string;
  name: string;
  floor?: string;
  tags: string[];
  status: SeatStatus;
  distance?: string;
  amenities?: string[];
}

interface SeatCardProps {
  seat: Seat;
  onReserve: (seatId: string) => void;
}

const statusConfig = {
  available: {
    label: "Available",
    className: "bg-success-light text-success border-success/20",
  },
  booked: {
    label: "Booked",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    className: "bg-warning-light text-warning border-warning/20",
  },
};

export function SeatCard({ seat, onReserve }: SeatCardProps) {
  const statusStyle = statusConfig[seat.status];

  return (
    <Card 
      className="p-4 hover:bg-card-hover transition-colors border-border group"
      role="article"
      aria-label={seat.name}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Primary info */}
          <div className="flex items-start gap-3 mb-2">
            <div className="mt-0.5 p-2 rounded-lg bg-primary-light text-primary">
              <Armchair className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base mb-1 truncate">
                {seat.name}
              </h3>
              {seat.distance && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{seat.distance}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags & amenities */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {seat.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Amenities */}
          {seat.amenities && seat.amenities.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{seat.amenities.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Status & CTA */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge className={statusStyle.className}>
            {statusStyle.label}
          </Badge>
          <Button
            size="sm"
            disabled={seat.status !== "available"}
            onClick={() => onReserve(seat.id)}
            className="min-w-[90px]"
            aria-label={`Reserve ${seat.name}`}
          >
            Reserve
          </Button>
        </div>
      </div>
    </Card>
  );
}
