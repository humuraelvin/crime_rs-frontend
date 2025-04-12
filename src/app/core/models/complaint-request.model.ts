export interface ComplaintRequest {
  fullName: string;
  contact: string;
  email: string;
  incidentDate: string;
  location: string;
  type: string;
  description: string;
  evidenceFiles?: File[];
  [key: string]: any; // Add index signature to allow string indexing
} 