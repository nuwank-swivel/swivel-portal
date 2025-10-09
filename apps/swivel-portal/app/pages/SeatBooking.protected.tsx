import ProtectedRoute from '../components/ProtectedRoute';
import SeatBooking from './SeatBooking';
export default function SeatBookingProtected() {
  return (
    <ProtectedRoute>
      <SeatBooking />
    </ProtectedRoute>
  );
}
