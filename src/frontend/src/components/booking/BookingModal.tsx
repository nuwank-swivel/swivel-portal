import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Seat } from "./SeatCard";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  selectedDate: Date;
  onConfirm: (bookingDetails: BookingDetails) => void;
}

export interface BookingDetails {
  seatId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}

const timePresets = [
  { label: "1 hour", duration: 1 },
  { label: "Half day", duration: 4 },
  { label: "Full day", duration: 8 },
];

const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 7; // 7 AM to 1 AM
  return `${hour.toString().padStart(2, "0")}:00`;
});

export function BookingModal({ isOpen, onClose, seat, selectedDate, onConfirm }: BookingModalProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!seat) return null;

  const handlePreset = (hours: number) => {
    const start = parseInt(startTime.split(":")[0]);
    const end = start + hours;
    setEndTime(`${end.toString().padStart(2, "0")}:00`);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirm({
      seatId: seat.id,
      date: selectedDate,
      startTime,
      endTime,
      notes,
    });
    
    setIsSubmitting(false);
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[550px]"
        aria-describedby="booking-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-light text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{seat.name}</div>
            </div>
          </DialogTitle>
          <DialogDescription id="booking-description">
            Configure your booking details including time, duration, and any special notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Display */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
            <Calendar className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Time</Label>
            
            {/* Quick Presets */}
            <div className="flex gap-2">
              {timePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(preset.duration)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-xs text-muted-foreground">
                  Start Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Select start time"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-xs text-muted-foreground">
                  End Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Select end time"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Warning (example) */}
          {startTime >= endTime && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-light border border-warning/20">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm text-warning-foreground">
                End time must be after start time
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special requirements or notes..."
              className="min-h-[80px] resize-none"
              aria-label="Booking notes"
            />
          </div>

          {/* Tags Display */}
          <div className="flex flex-wrap gap-1.5">
            {seat.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || startTime >= endTime}
            aria-live="polite"
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
