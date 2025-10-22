import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./pages/Dashboard.protected.tsx'),
  route('seat-booking', './pages/SeatBooking.protected.tsx'),
  route('team-directory', './pages/TeamDirectory.tsx'),
] satisfies RouteConfig;
