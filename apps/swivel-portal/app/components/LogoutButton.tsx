import { useMsal } from '@azure/msal-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { setIdToken } from '../lib/axios';

export default function LogoutButton() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await instance.logoutPopup();
    setIdToken(''); // Clear token from axios
    localStorage.clear(); // Clear all MSAL and app data
    navigate('/auth');
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
