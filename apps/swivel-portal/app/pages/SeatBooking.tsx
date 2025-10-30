import { useState, useEffect } from 'react';
import { Tabs } from '@mantine/core';
import CoreLayout from '../components/CoreLayout';
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';
import { MyBookingsPage } from '../components/booking/MyBookingsPage';
import { AllBookingsPage } from '../components/booking/AllBookingsPage';
import { NewBookingPage } from '../components/booking/NewBookingPage';

const SeatBooking = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'mine' | 'all'>('new');
  const { user } = useAuthContext();
  const { setCurrentModule } = useUIContext();
  const [newBookingRefreshSignal, setNewBookingRefreshSignal] = useState(0);
  const [myBookingsRefreshSignal, setMyBookingsRefreshSignal] = useState(0);

  useEffect(() => {
    setCurrentModule('Seat Booking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?.isAdmin && activeTab === 'all') {
      setActiveTab('new');
    }
  }, [user, activeTab]);

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    if (value === 'all' && !user?.isAdmin) return;
    setActiveTab(value as 'new' | 'mine' | 'all');
  };

  const handleMyBookingsChanged = () => {
    setNewBookingRefreshSignal((signal) => signal + 1);
  };

  const handleNewBookingChanged = () => {
    setMyBookingsRefreshSignal((signal) => signal + 1);
  };

  return (
    <CoreLayout>
      <Tabs value={activeTab} onChange={handleTabChange} keepMounted>
        <Tabs.List>
          <Tabs.Tab value="new">New booking</Tabs.Tab>
          <Tabs.Tab value="mine">My bookings</Tabs.Tab>
          {user?.isAdmin && <Tabs.Tab value="all">All bookings</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="new" pt="md">
          <NewBookingPage
            refreshSignal={newBookingRefreshSignal}
            onBookingChanged={handleNewBookingChanged}
          />
        </Tabs.Panel>

        <Tabs.Panel value="mine" pt="md">
          <MyBookingsPage
            onBookingsChanged={handleMyBookingsChanged}
            refreshSignal={myBookingsRefreshSignal}
          />
        </Tabs.Panel>

        {user?.isAdmin && (
          <Tabs.Panel value="all" pt="md">
            <AllBookingsPage />
          </Tabs.Panel>
        )}
      </Tabs>
    </CoreLayout>
  );
};

export default SeatBooking;
