import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./pages/Dashboard.protected.tsx'),
  route('auth', './pages/Login.tsx'),
  route('seat-booking', './pages/SeatBooking.protected.tsx'),
] satisfies RouteConfig;
