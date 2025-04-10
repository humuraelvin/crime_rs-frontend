export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
  roles?: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;
  refreshToken?: string;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  POLICE_OFFICER = 'POLICE_OFFICER',
  ADMIN = 'ADMIN'
} 