import { apiService } from './api';
import {
  Admin,
  LoginRequest,
  LoginResponse,
  UserRequest,
  AuthLevelResponse
} from '../types';

export const adminService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/login/admin', data);
  },

  async createAdmin(data: { fullName: string; email: string; password: string; phone: string }): Promise<Admin> {
    return apiService.post<Admin>('/admin/signup', data);
  },

  async getDashboard(): Promise<string[]> {
    return apiService.get<string[]>('/admin/dashboard');
  },

  async getPendingRequests(): Promise<UserRequest[]> {
    return apiService.get<UserRequest[]>('/admin/requests/pending');
  },

  async getPendingRequestById(id: string): Promise<UserRequest> {
    return apiService.get<UserRequest>(`/admin/requests/${id}`);
  },

  async approveRequest(requestId: string, adminId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.postRawString<{ id: string; status: string; message: string }>(`/admin/requests/${requestId}/approve`, adminId);
  },

  async rejectRequest(requestId: string, adminId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.postRawString<{ id: string; status: string; message: string }>(`/admin/requests/${requestId}/reject`, adminId);
  },

  async getAdminByEmail(email: string): Promise<Admin> {
    return apiService.get<Admin>(`/admin/email/${email}`);
  },

  async getAdminById(id: string): Promise<Admin> {
    return apiService.get<Admin>(`/admin/${id}`);
  },

  async getAllAdmins(): Promise<Admin[]> {
    return apiService.get<Admin[]>('/admin');
  },

  async updateAdmin(id: string, data: { fullName: string; email: string; phone: string }): Promise<Admin> {
    return apiService.put<Admin>(`/admin/${id}`, data);
  },

  async removeAdmin(id: string): Promise<void> {
    return apiService.delete<void>(`/admin/${id}`);
  },

  async checkAuthLevel(userId: string): Promise<AuthLevelResponse> {
    return apiService.get<AuthLevelResponse>(`/admin/auth-level/${userId}`);
  },

  async deleteAllPendingRequests(): Promise<void> {
    return apiService.delete<void>('/admin/requests/all');
  },

  async deletePendingRequest(id: string): Promise<void> {
    return apiService.delete<void>(`/admin/requests/${id}`);
  }
};
