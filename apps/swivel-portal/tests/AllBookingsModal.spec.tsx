import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { AllBookingsPage } from '../app/components/booking/AllBookingsPage';

const adminUser = {
  azureAdId: '1',
  name: 'Admin',
  email: 'admin@example.com',
  isAdmin: true,
};

jest.mock('@/lib/AuthContext', () => ({
  useAuthContext: () => ({ user: adminUser }),
}));

jest.mock('@/hooks/useExportBookingsExcel', () => ({
  useExportBookingsExcel: () => jest.fn(),
}));

jest.mock('@/lib/api/seatBooking', () => ({
  getAllBookingsForDate: jest.fn().mockResolvedValue([]),
}));

describe('AllBookingsPage', () => {
  it('shows empty state for admin users', async () => {
    render(<AllBookingsPage />);

    await waitFor(() =>
      expect(screen.getByText('No bookings for this date.')).toBeInTheDocument()
    );
  });
});
