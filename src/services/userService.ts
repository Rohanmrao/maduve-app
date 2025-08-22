import { apiService } from './api';
import {
  User,
  UserRequest,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ApplicationStatus,
  UserStatus
} from '../types';

export const userService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiService.post<SignupResponse>('/users/signup', data);
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/login/user', data);
  },

  async checkApplicationStatus(email: string): Promise<ApplicationStatus> {
    return apiService.get<ApplicationStatus>(`/login/status/${email}`);
  },

  async getUserByEmail(email: string): Promise<User> {
    return apiService.get<User>(`/users/email/${email}`);
  },

  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  },

  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return apiService.put<User>(`/users/${id}`, data);
  },

  async changeUserStatus(id: string, status: UserStatus): Promise<User> {
    return apiService.patch<User>(`/users/${id}/status`, { status });
  },

  async deleteUser(id: string, adminId: string): Promise<void> {
    return apiService.delete<void>(`/users/${id}?adminId=${adminId}`);
  },

  async uploadProfilePhoto(userId: string, file: File): Promise<{ message: string; size: number }> {
    return apiService.uploadFile<{ message: string; size: number }>(`/users/${userId}/photo`, file);
  },

  async deleteProfilePhoto(userId: string): Promise<void> {
    return apiService.delete<void>(`/users/${userId}/photo`);
  },

  async uploadProfileImage(userId: string, imageNumber: number, file: File): Promise<{ message: string; size: number }> {
    return apiService.uploadFile<{ message: string; size: number }>(`/profile-image/${userId}/upload/${imageNumber}`, file);
  },

  async deleteProfileImage(userId: string, imageNumber: number): Promise<void> {
    return apiService.delete<void>(`/profile-image/${userId}/image/${imageNumber}`);
  },

  async getAvailableImageSlots(userId: string): Promise<{ availableSlots: number[] }> {
    return apiService.get<{ availableSlots: number[] }>(`/profile-image/${userId}/available-slots`);
  },

  async getAllProfileImages(userId: string): Promise<{ userId: string; totalImages: number; images: Array<{ imageNumber: number; contentType: string; size: number; imageUrl: string }> }> {
    return apiService.get<{ userId: string; totalImages: number; images: Array<{ imageNumber: number; contentType: string; size: number; imageUrl: string }> }>(`/profile-image/${userId}/all`);
  }
};
