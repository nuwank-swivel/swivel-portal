import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./pages/Dashboard.tsx'),
  route('auth', './pages/Login.tsx'),
  route('seat-booking', './pages/SeatBooking.tsx'),
] satisfies RouteConfig;
