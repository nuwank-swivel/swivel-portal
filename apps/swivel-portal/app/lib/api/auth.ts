import api from '../axios';
import { User } from '../AuthContext';

export async function getUserInfo(): Promise<User | null> {
  try {
    const res = await api.post('/auth/login');
    const user = res.data as User;
    return user;
  } catch (error) {
    console.log('Error fetching user info:', error);
    return null;
  }
}
