import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type Seat } from "@/components/booking/SeatCard";
import { BookingModal, type BookingDetails } from "@/components/booking/BookingModal";
import { toast } from "sonner";

const mockSeats: Seat[] = [
  {
    id: "1",
    name: "Seat 1",
    floor: "Office",
    tags: ["Near Window"],
    status: "available",
    distance: "15m from you",
    amenities: ["Monitor", "USB-C Dock"],
  },
  {
    id: "2",
    name: "Seat 2",
    floor: "Office",
    tags: ["Quiet Zone"],
    status: "available",
    distance: "18m from you",
    amenities: ["Monitor"],
  },
  {
    id: "3",
    name: "Seat 3",
    floor: "Office",
    tags: ["Near Window"],
    status: "booked",
    distance: "20m from you",
    amenities: ["Monitor"],
  },
  {
    id: "4",
    name: "Seat 4",
    floor: "Office",
    tags: ["Standing Desk"],
    status: "available",
    distance: "25m from you",
    amenities: ["Dual Monitor", "USB-C Dock"],
  },
  {
    id: "5",
    name: "Seat 5",
    floor: "Office",
    tags: ["Near Window"],
    status: "pending",
    distance: "30m from you",
    amenities: ["Monitor"],
  },
];

export default function SeatBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReserve = (seatId: string) => {
    const seat = mockSeats.find((s) => s.id === seatId);
    if (seat && selectedDate) {
      setSelectedSeat(seat);
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = (details: BookingDetails) => {
    toast.success("Booking Confirmed", {
      description: `${selectedSeat?.name} reserved for ${details.startTime} - ${details.endTime}`,
      duration: 5000,
    });
    setIsModalOpen(false);
    setSelectedSeat(null);
  };

  const availableSeats = mockSeats.filter((s) => s.status === "available");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Seat Booking</h1>
              <p className="text-sm text-muted-foreground">Select a date to view available seats</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedDate ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Choose a date to book a seat
            </h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {selectedDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </h2>
                <div className="text-6xl font-bold text-primary mb-2">
                  {availableSeats.length}
                </div>
                <p className="text-muted-foreground">
                  {availableSeats.length === 1 ? 'seat available' : 'seats available'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    const firstAvailable = availableSeats[0];
                    if (firstAvailable) {
                      handleReserve(firstAvailable.id);
                    }
                  }}
                  disabled={availableSeats.length === 0}
                  className="min-w-[200px]"
                >
                  Book a Seat
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedDate(undefined)}
                  aria-label="Change date"
                >
                  Change Date
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSeat(null);
        }}
        seat={selectedSeat}
        selectedDate={selectedDate || new Date()}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
