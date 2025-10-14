import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AllBookingsModal } from '../app/components/booking/AllBookingsModal';
import * as UserContext from '../app/lib/UserContext';
import React from 'react';

const adminUser = {
  azureAdId: '1',
  name: 'Admin',
  email: 'admin@example.com',
  isAdmin: true,
};

jest.mock('../app/lib/UserContext', () => {
  const actual = jest.requireActual('../app/lib/UserContext');
  return {
    ...actual,
    useUser: () => ({ user: adminUser }),
  };
});

describe('AllBookingsModal', () => {
  it('renders without crashing for admin', () => {
    render(<AllBookingsModal opened={true} onClose={() => {}} />);
    // Just check modal title is present
    expect(screen.getByText('All Bookings (Admin)')).toBeInTheDocument();
  });
});
