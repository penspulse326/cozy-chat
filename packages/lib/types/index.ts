// Basic types
export type TestType = 'test';

export interface TestInterface {
  id: string;
  name: string;
}

// User-related types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Meeting-related types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  organizer: User;
  participants: User[];
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participantIds: string[];
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export enum Device {
  PC = '網站',
  MB = '行動裝置',
  APP = 'APP',
}
