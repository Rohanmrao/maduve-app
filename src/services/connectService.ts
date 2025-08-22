import { apiService } from './api';
import {
  ConnectRequest
} from '../types';

export const connectService = {
  async sendConnectRequest(senderId: string, receiverId: string, message: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/connect-requests/sender/${senderId}/send`, {
      receiverId,
      message
    });
  },

  async acceptConnectRequest(receiverId: string, senderId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/connect-requests/receiver/${receiverId}/accept/${senderId}`);
  },

  async rejectConnectRequest(receiverId: string, senderId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/connect-requests/receiver/${receiverId}/reject/${senderId}`);
  },

  async getPendingRequests(receiverId: string): Promise<ConnectRequest[]> {
    return apiService.get<ConnectRequest[]>(`/connect-requests/receiver/${receiverId}/pending`);
  },

  async getSentRequests(senderId: string): Promise<ConnectRequest[]> {
    return apiService.get<ConnectRequest[]>(`/connect-requests/sender/${senderId}/sent`);
  },

  async checkConnectionStatus(senderId: string, receiverId: string): Promise<{ hasActiveConnection: boolean }> {
    return apiService.get<{ hasActiveConnection: boolean }>(`/connect-requests/check/${senderId}/${receiverId}`);
  }
};
