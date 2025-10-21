export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ecclesia: string;
  language: string;
  education: string;
  bio: string;
  hasProfilePhoto: boolean;
  hasProfileImage1?: boolean;
  hasProfileImage2?: boolean;
  hasProfileImage3?: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ecclesia: string;
  language: string;
  education: string;
  bio: string;
  status: UserStatus;
  createdAt: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface ConnectRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  message: string;
  status: ConnectRequestStatus;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  userType: 'User' | 'Admin';
  userName: string;
  status: UserStatus;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  ecclesia: string;
  language: string;
  education: string;
  bio: string;
}

export interface SignupResponse {
  message: string;
  requestId: string;
}

export interface ApplicationStatus {
  email: string;
  status: UserStatus;
  message: string;
  createdAt: string;
  processedAt: string | null;
  adminName: string | null;
}

export interface ProfileImage {
  imageNumber: number;
  contentType: string;
  size: number;
  imageUrl: string;
}

export interface ProfileImagesResponse {
  userId: string;
  totalImages: number;
  images: ProfileImage[];
}

export interface AvailableSlotsResponse {
  availableSlots: number[];
}

export interface AuthLevelResponse {
  userId: string;
  authLevel: 'Admin' | 'User' | 'Unknown';
}

export type DashboardResponse = string[];

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export enum UserStatus {
  Pending = 0,
  Active = 1,
  Inactive = 2,
  Blocked = 3,
  InTalks = 4
}

export enum ConnectRequestStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.Pending]: 'Pending',
  [UserStatus.Active]: 'Active',
  [UserStatus.Inactive]: 'Inactive',
  [UserStatus.Blocked]: 'Blocked',
  [UserStatus.InTalks]: 'In Talks'
};

export const ConnectRequestStatusLabels: Record<ConnectRequestStatus, string> = {
  [ConnectRequestStatus.Pending]: 'Pending',
  [ConnectRequestStatus.Accepted]: 'Accepted',
  [ConnectRequestStatus.Rejected]: 'Rejected'
};
