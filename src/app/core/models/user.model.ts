export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  mfaEnabled: boolean;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  POLICE_OFFICER = 'POLICE_OFFICER',
  ADMIN = 'ADMIN'
} 