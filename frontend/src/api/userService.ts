import { apiWithRetry } from './config';

export interface BasicUser {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  isActive?: boolean;
}

class UserService {
  async getAllUsers(): Promise<BasicUser[]> {
    const response = await apiWithRetry.get<any>('/user/all');
    const data = response.data;

    const list = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];
    return list.map((u: any) => ({
      id: u._id ?? u.id,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      isActive: u.isActive,
    }));
  }
}

export const userService = new UserService();
