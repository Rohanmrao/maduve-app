import { apiService } from './api';
import {
  ConnectRequest
} from '../types';

export const connectService = {
  async sendConnectRequest(senderId: string, receiverId: string, message: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/ConnectRequest/sender/${senderId}/send`, {
      receiverId,
      message
    });
  },

  async acceptConnectRequest(receiverId: string, senderId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/ConnectRequest/receiver/${receiverId}/accept/${senderId}`);
  },

  async rejectConnectRequest(receiverId: string, senderId: string): Promise<{ id: string; status: string; message: string }> {
    return apiService.post<{ id: string; status: string; message: string }>(`/ConnectRequest/receiver/${receiverId}/reject/${senderId}`);
  },

  async getPendingRequests(receiverId: string): Promise<ConnectRequest[]> {
    return apiService.get<ConnectRequest[]>(`/ConnectRequest/receiver/${receiverId}/pending`);
  },

  async getSentRequests(senderId: string): Promise<ConnectRequest[]> {
    return apiService.get<ConnectRequest[]>(`/ConnectRequest/sender/${senderId}/sent`);
  },

  async checkConnectionStatus(senderId: string, receiverId: string): Promise<{ hasActiveConnection: boolean }> {
    return apiService.get<{ hasActiveConnection: boolean }>(`/ConnectRequest/check/${senderId}/${receiverId}`);
  }
};
