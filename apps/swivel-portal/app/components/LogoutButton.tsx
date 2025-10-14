import { useMsal } from '@azure/msal-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { setIdToken } from '../lib/axios';
import { useUser } from '@/lib/UserContext';

export default function LogoutButton() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogout = async () => {
    await instance.logoutPopup();
    setIdToken(''); // Clear token from axios
    localStorage.clear(); // Clear all MSAL and app data
    setUser(null); // Clear user from context
    navigate('/auth');
  };

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
